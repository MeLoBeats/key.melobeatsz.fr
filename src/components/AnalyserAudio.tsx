import { createSignal, onMount } from "solid-js";
import EssentiaModule from "essentia.js";
import { Plausible } from "plausible-client";
// Liste des thèmes DaisyUI (tu peux les modifier à ta guise)
const plausible = new Plausible({
    apiHost: "plausible.melobeatsz.fr",
    domain: "key.melobeatsz.fr",
})
const themes = ["light", "dark", "cupcake", "synthwave", "retro"];

export default function AnalyseurAudio() {
    const [essentia, setEssentia] = createSignal<any>(null);
    const [isReady, setIsReady] = createSignal(false);
    const [loading, setLoading] = createSignal(false);
    const [key, setKey] = createSignal<any>(null);
    const [bpm, setBpm] = createSignal<number | null>(null);
    const [error, setError] = createSignal<string | null>(null);

    onMount(() => {
        try {
            const wasm = EssentiaModule.EssentiaWASM.EssentiaWASM;
            const instance = new EssentiaModule.Essentia(wasm, false);
            setEssentia(instance);
            setIsReady(true);
        } catch (err) {
            setError("Erreur lors de l'initialisation d'Essentia.js.");
        }
    });

    async function extractAudioBuffer(file: File): Promise<AudioBuffer> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioCtx = new AudioContext();
            return await audioCtx.decodeAudioData(arrayBuffer);
        } catch {
            throw new Error("Erreur de décodage du fichier audio.");
        }
    }

    const handleFileChange = async (e: Event) => {
        setError(null);
        setKey(null);
        setBpm(null);

        if (!isReady() || !essentia()) {
            setError("Essentia.js non prêt !");
            return;
        }
        const input = e.target as HTMLInputElement;
        if (!input.files || !input.files[0]) {
            setError("Aucun fichier sélectionné.");
            return;
        }
        const file = input.files[0];
        setLoading(true);

        try {
            plausible.trackEvent('File Upload') // Uncomment and import plausible if you use it
            const audioBuffer = await extractAudioBuffer(file);
            const left = audioBuffer.getChannelData(0);

            let vector;
            if (essentia().arrayToVector) {
                vector = essentia().arrayToVector(Array.from(left));
            } else {
                vector = left;
            }

            const keyData = essentia().KeyExtractor(
                vector,
                true, 4096, 4096, 12, 3500, 60, 25, 0.2, "bgate",
                audioBuffer.sampleRate, 0.0001, 440, "cosine", "hann"
            );
            setKey(keyData);

            if (essentia().PercivalBpmEstimator) {
                const bpmData = essentia().PercivalBpmEstimator(
                    vector, 1024, 2048, 128, 128, 210, 50, audioBuffer.sampleRate
                );
                setBpm(Math.round(bpmData.bpm)); // <-- Affichage entier
            } else {
                setBpm(null);
            }
        } catch (err: any) {
            setError(err?.message ?? "Erreur d'analyse.");
        } finally {
            setTimeout(() => setLoading(false), 60);
        }
    };

    return (
        <div class="bg-base-200 flex flex-col justify-between">

            {/* MAIN CONTENT */}
            <main class="flex-1 flex flex-col items-center justify-center px-24">
                <div class="w-full max-w-lg mt-20 p-8 bg-base-100 rounded-xl shadow-xl">

                    <h2 class="font-bold text-2xl mb-4 text-primary text-center">
                        🎵 Analyseur Audio
                    </h2>

                    <label class="block mb-4">
                        <span class="label-text mb-2 block">Sélectionne un fichier audio :</span>
                        <input
                            type="file"
                            accept="audio/*"
                            class="file-input file-input-bordered w-full"
                            onChange={handleFileChange}
                            disabled={loading()}
                        />
                    </label>

                    {loading() && (
                        <div class="flex items-center justify-center gap-2 my-6">
                            <span class="loading loading-spinner loading-lg text-primary"></span>
                            <span class="text-primary">Analyse en cours...</span>
                        </div>
                    )}

                    {error() && (
                        <div class="alert alert-error shadow-lg my-4">
                            <span>{error()}</span>
                        </div>
                    )}

                    {!loading() && !error() && key() && (
                        <div class="my-6">
                            <div class="card bg-base-200 shadow-md mb-4">
                                <div class="card-body">
                                    <h3 class="card-title text-secondary">🎼 Gamme détectée</h3>
                                    <div class="flex gap-4 items-center mt-2">
                                        <div class="badge badge-primary badge-lg font-mono text-xl">
                                            {key().key}
                                        </div>
                                        <div class="badge badge-accent badge-lg font-mono text-lg capitalize">
                                            {key().scale}
                                        </div>
                                        <div class="tooltip" data-tip="Fiabilité">
                                            <div class="badge badge-outline badge-info">
                                                {Math.round((key().strength ?? 0) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-2 text-sm text-gray-500">
                                        (Force : {Math.round((key().strength ?? 0) * 100)}%)
                                    </div>
                                </div>
                            </div>

                            {bpm() && (
                                <div class="card bg-base-200 shadow-md">
                                    <div class="card-body">
                                        <h3 class="card-title text-secondary">💃 BPM estimé</h3>
                                        <div class="text-2xl font-mono text-primary">
                                            {Math.round(bpm()!)} <span class="text-base text-gray-400">BPM</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!isReady() && !error() && (
                        <div class="flex justify-center my-6">
                            <span class="loading loading-spinner loading-lg text-primary"></span>
                            <span class="ml-2 text-primary">Chargement d’Essentia.js…</span>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
