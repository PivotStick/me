/**
 * @param {string} content
 */
export const parse = (content) => {
    let i = 0;

    /**
     * @type {{
     *  html: { fragments: any[]; }
     * }}
     */
    const ast = { html: {} };

    ast.html.fragments = parseFragments(() => i < content.length);

    return ast;

    function parseFragments(condition) {
        const fragments = [];

        while (condition()) {
            const fragment = parseFragment();
            if (fragment) {
                fragments.push(fragment);
            }
        }

        return fragments;
    }
    function parseFragment() {
        return parseElement() || parseMustache() || parseText();
    }
    function parseElement() {
        if (match("<")) {
            eat("<");
            const tagName = read(/^[\w\d-]/);
            const endTagName = `</${tagName}>`;
            const attributes = parseAttributeList();
            const children = parseFragments(
                () => !match(endTagName) && i < content.length
            );
            eat(endTagName);

            return {
                type: "Element",
                name: tagName,
                attributes,
                children,
            };
        }
    }
    function parseText() {
        const value = read(/^[^<]/);
        if (value.trim()) {
            return {
                type: "Text",
                value,
            };
        }
    }
    function parseAttributeList() {
        const attributes = [];

        skipWhitespaces();
        while (!match(">")) {
            attributes.push(parseAttribute());
            skipWhitespaces();
        }
        eat(">");

        return attributes;
    }
    function parseAttribute() {
        const name = read(/^[^=]/);
        eat('="');
        const value = read(/^[^"]/);
        eat('"');
        return {
            type: "Attribute",
            name,
            value,
        };
    }
    function parseMustache() {
        if (match(/^{{/)) {
            eat("{{");
            const expression = read(/^(?!}})/);
            eat("}}");

            return {
                type: "MustacheExpression",
                expression: {
                    type: "Identifier",
                    name: expression.trim(),
                },
            };
        }
    }

    // utils

    /**
     * @param {string | RegExp} pattern
     */
    function match(pattern) {
        if (typeof pattern === "string") {
            return content.slice(i, i + pattern.length) === pattern;
        } else {
            return pattern.test(content.slice(i));
        }
    }

    /**
     * @param {string} str
     */
    function eat(str) {
        if (match(str)) {
            i += str.length;
        } else {
            let ln = 0;
            let col = 0;
            let cursor = 0;

            while (cursor < content.length) {
                if (content[cursor] === "\n") {
                    col = 0;
                    ln++;
                } else {
                    col++;
                }

                cursor++;
            }

            throw new Error(`Expected ${str} at ${ln}:${col}`);
        }
    }

    /**
     * @param {RegExp} regex
     */
    function read(regex) {
        const start = i;

        while (regex.test(content.slice(i)) && i < content.length) {
            i++;
        }

        return content.slice(start, i);
    }

    function skipWhitespaces() {
        read(/^[\s\n]/);
    }
};
