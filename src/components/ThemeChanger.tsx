import { createSignal, onMount } from "solid-js";

const themes = ["synthwave", "light", "dark", "cupcake", "retro"];


export default function ThemeChanger() {

    const [theme, setTheme] = createSignal(themes[0]); // Par défaut "light"
    onMount(() => {
        document.documentElement.setAttribute("data-theme", theme()); // theme initial
    })
    // Gestion du thème DaisyUI
    function handleThemeChange() {
        // Tourne dans la liste
        const idx = themes.indexOf(theme());
        setTheme(themes[(idx + 1) % themes.length]);
        // Change le data-theme sur <html> ou <body>
        document.documentElement.setAttribute("data-theme", themes[(idx + 1) % themes.length]);
    }
    return (

        <div class="fixed left-0 top-0 z-50 m-3">
            <button
                class="btn btn-circle btn-ghost tooltip tooltip-right"
                aria-label="Changer le thème"
                data-tip={`Changer le thème (${theme()})`}
                onClick={handleThemeChange}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m13.07 7.07l-.71-.71M6.34 6.34l-.71-.71m12.02 12.02l-.71-.71M6.34 17.66l-.71-.71M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        </div>
    )
}