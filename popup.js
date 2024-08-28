import { pdfjsLib } from './pdf-loader.js';

const pdfUrl = 'Constitution of the Republic of Uganda.pdf'; 

async function loadPdf() {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const { text, pageStarts } = await extractTextFromPdf(pdf);
    return { text, pageStarts };
}

async function extractTextFromPdf(pdf) {
    let text = '';
    let pageStarts = [0];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        text += pageText + '\n';
        pageStarts.push(text.length);
    }
    return { text, pageStarts };
}

document.getElementById('searchButton').addEventListener('click', async function() {
    const searchTerm = document.getElementById('searchQuery').value;
    if (searchTerm) {
        try {
            document.getElementById('loadingDiv').style.display = 'block';
            const { text, pageStarts } = await loadPdf();
            const results = searchConstitution(searchTerm, text, pageStarts);
            displayResults(results, searchTerm);
        } catch (error) {
            console.error('Error during search:', error);
            alert('An error occurred while searching. Please try again.');
        } finally {
            document.getElementById('loadingDiv').style.display = 'none';
        }
    } else {
        alert('Please enter a search term.');
    }
});


function searchConstitution(term, text, pageStarts) {
    const sentenceRegex = /[^.!?]*[.!?]/g;
    const matches = [];
    let match;

    while ((match = sentenceRegex.exec(text)) !== null) {
        const sentence = match[0];
        const searchTermRegex = new RegExp(term, 'i');

        if (searchTermRegex.test(sentence)) {
            const pageNumber = pageStarts.findIndex(start => start > match.index) - 1;
            matches.push({
                sentence: sentence.trim(),
                index: match.index,
                page: pageNumber
            });
        }
    }
    return matches;
}


document.getElementById('results').addEventListener('click', function(event) {
    if (event.target.tagName === 'A' && event.target.dataset.page) {
        event.preventDefault();
        const page = parseInt(event.target.dataset.page, 10); 
        const searchTerm = event.target.dataset.term;
        openPdfAtPage(page, searchTerm);
    }
});

function displayResults(results, searchTerm) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (results.length === 0) {
        resultsDiv.innerText = 'No results found.';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        const highlightedSentence = result.sentence.replace(new RegExp(searchTerm, 'gi'), '<strong>$&</strong>');
        resultItem.innerHTML = `
            <p>${highlightedSentence}</p>
            <small>
                Found on page ${result.page + 1} at position: ${result.index}
                <a href="#" data-page="${result.page}" data-term="${searchTerm}">View in PDF</a>
            </small>
        `;
        resultsDiv.appendChild(resultItem);
    });
}

document.getElementById('googleButton').addEventListener('click', function() {
    const searchTerm = document.getElementById('searchQuery').value;
    if (searchTerm) {
        const query = `Ugandan law on ${searchTerm}`;
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(googleSearchUrl, '_blank');
    } else {
        alert('Please enter a search term.');
    }
});

function openPdfAtPage(pageNumber) {
    const pdfUrl = 'Constitution of the Republic of Uganda.pdf';
    const pdfWithPage = `${pdfUrl}#page=${pageNumber + 1}`;
    window.open(pdfWithPage, '_blank');
}
