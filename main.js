import App from "./src/App.twig";

new App({
    target: document.getElementById("app"),
    props: {
        counter: 0,
    },
});

// import { Fragment, h, render, renderList } from "vue";

// const target = document.getElementById("app");
// const props = {
//     show: false,
//     users: [{ name: "Vincent" }],
// };

// function toggle() {
//     props.show = !props.show;
//     props.users.push({ name: "Maxime" });
//     invalidate();
// }

// function invalidate() {
//     const vnode = h(Fragment, [
//         h("h1", ["Coucou"]),
//         h("button", { onClick: toggle }, ["Toggle"]),
//         props.show ? h("p", ["I'm shown!"]) : undefined,
//         h(
//             "ul",
//             props.users.map((item) => h("li", [item.name]))
//         ),
//     ]);

//     render(vnode, target);
// }

// invalidate();
