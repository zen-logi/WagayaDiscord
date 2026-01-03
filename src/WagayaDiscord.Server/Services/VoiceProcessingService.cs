using RNNoise.NET;
using WagayaDiscord.Server.Services.Interfaces;

namespace WagayaDiscord.Server.Services;

/// <inheritdoc />
public class VoiceProcessingService : IVoiceProcessingService, IDisposable
{
    private readonly Denoiser _denoiser;
    private bool _disposed;

    /// <summary>
    /// VoiceProcessingServiceのコンストラクタ。
    /// RNNoiseデノイザーを初期化します。
    /// </summary>
    public VoiceProcessingService()
    {
        _denoiser = new Denoiser();
    }

    /// <inheritdoc />
    public byte[] ProcessAudio(byte[] pcmData)
    {
        if (pcmData == null || pcmData.Length == 0)
            return pcmData ?? [];

        // PCM 16bit (byte[]) を Float32 に変換
        var samples = pcmData.Length / 2; // 16bit = 2 bytes per sample
        var floatBuffer = new float[samples];

        for (int i = 0; i < samples; i++)
        {
            short sample = BitConverter.ToInt16(pcmData, i * 2);
            floatBuffer[i] = sample / 32768f;
        }

        // RNNoiseでノイズ除去を適用
        // Denoiser.Denoise は内部でフレームバッファリングを処理
        _denoiser.Denoise(floatBuffer);

        // Float32 を PCM 16bit (byte[]) に戻す
        var outputBuffer = new byte[pcmData.Length];
        for (int i = 0; i < samples; i++)
        {
            float sample = Math.Clamp(floatBuffer[i], -1f, 1f);
            short pcmSample = (short)(sample * 32767f);
            BitConverter.TryWriteBytes(outputBuffer.AsSpan(i * 2), pcmSample);
        }

        return outputBuffer;
    }

    /// <summary>
    /// リソースを解放します。
    /// </summary>
    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    /// <summary>
    /// リソースを解放します。
    /// </summary>
    /// <param name="disposing">マネージドリソースを解放する場合はtrue。</param>
    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;

        if (disposing)
        {
            _denoiser.Dispose();
        }

        _disposed = true;
    }
}
