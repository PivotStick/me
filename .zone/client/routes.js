export default [
    [
        /^\/$/,
        () => import("../../src/routes/+page.twig"),
        () => import("../../src/routes/+layout.twig"),
    ],
    [
        /^\/bonsoir$/,
        () => import("../../src/routes/bonsoir/+page.twig"),
        () => import("../../src/routes/+layout.twig"),
    ],
];
