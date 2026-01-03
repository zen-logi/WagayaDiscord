import { useState, useEffect, useRef, useCallback } from 'react';
import { useSignalR } from './useSignalR';

// Audio settings
const SAMPLE_RATE = 48000;
const CHANNELS = 1;
const BUFFER_SIZE = 4096; // Adjust latency vs stutter

export const useVoice = () => {
    const { voiceConnection } = useSignalR();

    // State for UI handling
    const [isJoined, setIsJoined] = useState(false);
    const [currentVoiceChannelId, setCurrentVoiceChannelId] = useState<string | null>(null);

    // Ref for callback handling (stale closure prevention)
    const isJoinedRef = useRef(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    // Audio Playback
    const playQueueRef = useRef<Float32Array[]>([]);
    const nextStartTimeRef = useRef(0);

    // Initialize AudioContext
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: SAMPLE_RATE,
        });
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    // Handle Incoming Audio
    useEffect(() => {
        if (!voiceConnection) return;

        voiceConnection.on('ReceiveAudio', (senderId, audioDataBase64) => {
            // Decode Base64 to Float32
            const binaryString = window.atob(audioDataBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Convert Int16 bytes to Float32 (-1.0 to 1.0)
            // Assuming Little Endian from C# BitConverter/BinaryWriter
            const int16 = new Int16Array(bytes.buffer);
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) {
                float32[i] = int16[i] / 32768.0;
            }

            playQueueRef.current.push(float32);
            schedulePlayback();
        });

        return () => {
            voiceConnection.off('ReceiveAudio');
        };
    }, [voiceConnection]);

    const schedulePlayback = () => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // Resume context if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        while (playQueueRef.current.length > 0) {
            const bufferData = playQueueRef.current.shift();
            if (!bufferData) break;

            const buffer = ctx.createBuffer(CHANNELS, bufferData.length, SAMPLE_RATE);
            buffer.copyToChannel(bufferData, 0);

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);

            if (nextStartTimeRef.current < ctx.currentTime) {
                nextStartTimeRef.current = ctx.currentTime;
            }

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
        }
    };

    const joinVoice = useCallback(async (channelId: string) => {
        if (!voiceConnection || !audioContextRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            streamRef.current = stream;

            const ctx = audioContextRef.current;
            await ctx.resume();

            const source = ctx.createMediaStreamSource(stream);
            sourceRef.current = source;

            // Use ScriptProcessor for capture
            const processor = ctx.createScriptProcessor(BUFFER_SIZE, CHANNELS, CHANNELS);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (!isJoinedRef.current) return; // Use ref to get current value inside callback

                const inputData = e.inputBuffer.getChannelData(0);

                // Convert Float32 to Int16
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                const uint8 = new Uint8Array(pcmData.buffer);

                voiceConnection.invoke('SendAudio', channelId, uint8)
                    .catch(err => console.error('Audio send error:', err));
            };

            // Connect graph
            source.connect(processor);

            // Mute local feedback
            const gain = ctx.createGain();
            gain.gain.value = 0;
            processor.connect(gain);
            gain.connect(ctx.destination); // Required for Chrome to fire onaudioprocess

            await voiceConnection.invoke('JoinVoice', channelId);

            // Update state
            isJoinedRef.current = true;
            setIsJoined(true);
            setCurrentVoiceChannelId(channelId);
            console.log('Joined Voice Channel:', channelId);

        } catch (err) {
            console.error('Error joining voice:', err);
        }
    }, [voiceConnection]);

    const leaveVoice = useCallback(async () => {
        if (voiceConnection && currentVoiceChannelId) {
            await voiceConnection.invoke('LeaveVoice', currentVoiceChannelId);
        }

        isJoinedRef.current = false;
        setIsJoined(false);
        setCurrentVoiceChannelId(null);

        // Stop tracks
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        // Disconnect nodes
        sourceRef.current?.disconnect();
        processorRef.current?.disconnect();

        // Reset pointers
        sourceRef.current = null;
        processorRef.current = null;
    }, [voiceConnection, currentVoiceChannelId]);

    return {
        joinVoice,
        leaveVoice,
        isJoined,
        currentVoiceChannelId
    };
};
