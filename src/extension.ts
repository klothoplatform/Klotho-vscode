import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

    let timeout: NodeJS.Timer | undefined = undefined;

    // create a decorator type that we use to decorate klotho annotations
    const annotationDecorationType = vscode.window.createTextEditorDecorationType({
        gutterIconPath: context.asAbsolutePath("Klotho.svg"),
        gutterIconSize: "70%"
    });

    let activeEditor = vscode.window.activeTextEditor;

    function updateDecorations() {
        if (!activeEditor) {
            return;
        }
        const regEx = /(?<=\s*(?:#|\/\/|\*)\s*)(@klotho::\w+)/gm;
        const text = activeEditor.document.getText();
        const annotations: vscode.DecorationOptions[] = [];
        let match;
        while ((match = regEx.exec(text))) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Capability **' + match[0] + '**' };
            annotations.push(decoration);
        }
        activeEditor.setDecorations(annotationDecorationType, annotations);
    }

    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 500);
        } else {
            updateDecorations();
        }
    }

    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations(true);
        }
    }, null, context.subscriptions);

}