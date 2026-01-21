declare module 'html-to-text' {
    export interface HtmlToTextOptions {
        wordwrap?: number | null;
        selectors?: Array<{
            selector: string;
            format?: string;
            options?: object;
        }>;
        [key: string]: unknown;
    }
    export function convert(html: string, options?: HtmlToTextOptions): string;
    export function htmlToText(html: string, options?: HtmlToTextOptions): string;
}
