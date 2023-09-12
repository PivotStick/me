import * as Vue from "vue/dist/vue.esm-browser.js";
import * as Twig from "twig";

const target = document.getElementById("app");

const twigTemplate = `<!--[--><h1>{{ counter }}</h1><button v-on:click="counter--">Decrement</button><button v-on:click="counter++">Increment</button>{% if counter > 10 %}<p>Counter is greater than 10</p>{% elseif counter > 5 and counter < 10 %}<p>Counter is between 5 and 10</p>{% else %}<p>Else</p>{% endif %}<div>_-_-_-_-_-_</div><ul>{% for user in users %}<li>{{ user.name }}</li>{% endfor %}</ul><!--]-->`;
const props = { counter: 10, users: [{ name: "Vincent" }] };

target.innerHTML = Twig.twig({ data: twigTemplate }).render(props);

setTimeout(() => {
    const r = twigTemplate
        .replace(
            /\{% if ([^%]*) %\}/g,
            (_, condition) =>
                `<template v-if="${condition
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")}">`
        )
        .replace(
            /\{% elseif ([^%]*) %\}/g,
            (_, condition) =>
                `</template><template v-else-if="${condition
                    .replace(/and/g, "&&")
                    .replace(/or/g, "||")}">`
        )
        .replace(/\{% else %\}/g, "</template><template v-else>")
        .replace(/\{% endif %\}/g, "</template>")
        .replace(/\{% for ([^%]*) %\}/g, `<template v-for="$1">`)
        .replace(/\{% endfor %\}/g, "</template>")
        .replace(/<!--[\[\]]-->/g, "");

    console.log(r);
    const component = Vue.h({
        data() {
            return props;
        },
        template: r,
    });

    Vue.hydrate(component, target);
}, 2000);

// const node = Vue.h({
//     setup() {
//         const counter = Vue.ref(2);

//         return { counter, users: [{ name: "Vincent" }] };
//     },

//     template: `
//         <h1>{{ counter }}</h1>
//         <button v-on:click="counter++">Increment</button>
//         <ul>
//             <template v-for="user in users">
//                 <li>{{ user.name }}</li>
//             </template>
//         </ul>
//     `,
// });

// Vue.render(node, target);
