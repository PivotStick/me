import { defineConfig } from "vite";
import fs from "fs/promises";
import { existsSync } from "fs";
import { compile, preprocess } from "svelte/compiler";
import sveltePreprocess from "svelte-preprocess";
import Twig from "twig";
import { b, print } from "code-red";
import { join } from "path";

/**
 * @param {string} id
 * @param {string} code
 */
const componentToClient = async (id, code) => {
    const cssPath = id.replace(".twig", ".css");
    const scssPath = id.replace(".twig", ".scss");
    const jsPath = id.replace(".twig", ".js");

    const hasCss = existsSync(cssPath);
    const hasScss = existsSync(scssPath);
    const hasJs = existsSync(jsPath);

    let result = "";

    if (hasJs) {
        result += `<script>${await fs.readFile(jsPath, "utf-8")}</script>`;
    }

    result += code
        .replace(/{#[\s\S]*#}/g, "")
        .replace(/{% for (.*) in (.*) %}/g, "{#each $2 as $1}")
        .replace(/{% endfor %}/g, "{/each}")
        .replace(/{{([^}]*)}}/g, (_, ex) => `{${ex.trim()}}`)
        .replace(/{% if (.*) %}/g, "{#if $1}")
        .replace(/{% else %}/g, "{:else}")
        .replace(/{% else if (.*) %}/g, "{:else if $1}")
        .replace(/{% endif %}/g, "{/if}");

    if (hasCss) {
        result += `<style>${await fs.readFile(cssPath, "utf-8")}</style>`;
    }

    if (hasScss) {
        result += `<style lang="scss">${await fs.readFile(
            scssPath,
            "utf-8"
        )}</style>`;
    }

    const preprocessed = await preprocess(result, sveltePreprocess());

    return compile(preprocessed.code, {
        cssHash: ({ css, hash }) => `zone-${hash(css)}`,
        hydratable: true,
    });
};

/**
 * @param {string} id
 * @param {string} code
 */
const componentToTwig = async (id, code) => {
    const data = code
        .replace(/<style>[\s\S]*<\/style>/g, "")
        .replace(/<script>[\s\S]*<\/script>/g, "")
        .replace(/(on|transition|in|out):\w+="[^"]+"/g, "")
        .replace(/bind:/g, "")
        .trim();

    return data;
};

/**
 * @returns {import("vite").Plugin}
 */
const zone = () => {
    return {
        name: "vite-plugin-zone",
        resolveId(source, importer, options) {
            if (source.startsWith("component:")) {
                return join("src/lib/components", source.slice(10) + ".twig");
            }
        },

        async transform(code, id, options) {
            if (id.endsWith(".twig")) {
                if (options.ssr) {
                    const data = await componentToTwig(id, code);
                    const body = b`
                        import Twig from "twig";

                        const template = Twig.twig({
                            data: \`${data.replace(/`/g, "\\`")}\`
                        });

                        export default function render(props) {
                            return template.render(props);
                        }
                    `;

                    return print({ type: "Program", body });
                } else {
                    return (await componentToClient(id, code)).js;
                }
            }
        },

        async transformIndexHtml(html, ctx) {
            const module = await ctx.server.ssrLoadModule(
                "/src/routes/+page.twig"
            );
            return html.replace(
                /%zone\.body%/,
                module.default({ data: { counter: 2 } }) +
                    `<script>
                    {
                        const target = document.currentScript.parentElement;

                        Promise.all([
                            import("/@vite/client"),
                            import("/.zone/client/init.js")
                        ]).then(([,zone]) => {
                            zone.start({
                                target,
                                props: { data: { counter: 2 } }
                            })
                        })
                    }
                </script>`
            );
        },
    };
};

export default defineConfig({
    plugins: [zone()],
});
