namespace WagayaDiscord.Server.Services.Interfaces;

/// <summary>
/// 音声データの処理を担当するサービスのインターフェース。
/// ノイズキャンセル、エコー除去などの音声処理機能を提供します。
/// </summary>
public interface IVoiceProcessingService
{
    /// <summary>
    /// 生のPCM音声データを処理し、ノイズ除去などの加工を行います。
    /// </summary>
    /// <param name="pcmData">
    /// 入力PCMデータ。48kHz、16bit、モノラル形式である必要があります。
    /// </param>
    /// <returns>
    /// ノイズ除去などの処理が適用されたPCMデータ。
    /// 入力と同じフォーマット（48kHz、16bit、モノラル）で返されます。
    /// </returns>
    /// <remarks>
    /// RNNoiseを使用したAIベースのノイズキャンセル処理を行います。
    /// 入力データは480サンプル（10ms）の倍数である必要があります。
    /// </remarks>
    byte[] ProcessAudio(byte[] pcmData);
}
