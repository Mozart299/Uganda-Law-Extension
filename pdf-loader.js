import * as pdfjsLib from './node_modules/pdfjs-dist/build/pdf.mjs';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.mjs';

export { pdfjsLib };