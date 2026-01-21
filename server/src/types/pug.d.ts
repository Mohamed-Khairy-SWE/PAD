declare module 'pug' {
    export function renderFile(path: string, options?: object): string;
    export function compile(template: string, options?: object): (locals?: object) => string;
    export function compileFile(path: string, options?: object): (locals?: object) => string;
}
