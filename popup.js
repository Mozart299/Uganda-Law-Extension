import { pdfjsLib } from './pdf-loader.js';

const pdfUrl = 'Constitution of the Republic of Uganda.pdf';

async function loadPdf() {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const { text } = await extractTextFromPdf(pdf);
    const articles = parseArticles(text);
    return { articles };
}

async function extractTextFromPdf(pdf) {
    let text = '';
    const startPage = 27; // Start from page 27
    const totalPages = pdf.numPages;

    for (let i = startPage; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        text += pageText + '\n';
    }
    return { text };
}

function parseArticles(text) {
    console.log('Starting to parse articles');
    // Updated regex to match the specific article format
    const articleRegex = /(\d+)\.\s+([^.]+)\.\s*((?:\(\d+\)[\s\S]+?(?=\d+\.|$))+)/g;
    const articles = {};
    let match;
    let count = 0;

    while ((match = articleRegex.exec(text)) !== null) {
        count++;
        const articleNumber = parseInt(match[1]);
        const articleTitle = match[2].trim();
        const content = match[3].trim();
        articles[articleNumber] = {
            title: articleTitle,
            clauses: parseClausesForArticle(content)
        };
        
        console.log(`Parsed Article ${articleNumber}: ${articleTitle}`);
        if (count <= 3) {
            console.log(`Sample content for Article ${articleNumber}:`, content.substring(0, 100));
        }
    }

    console.log(`Total articles parsed: ${Object.keys(articles).length}`);
    return articles;
}

function parseClausesForArticle(articleContent) {
    // Updated regex to match the specific clause format
    const clauseRegex = /\((\d+)\)\s+([^(]+)(?=\(\d+\)|$)/g;
    const clauses = {};
    let match;

    while ((match = clauseRegex.exec(articleContent)) !== null) {
        const clauseNumber = parseInt(match[1]);
        const content = match[2].trim();
        clauses[clauseNumber] = content;
    }

    return clauses;
}

// Update the searchConstitution function to handle the new article structure
function searchConstitution(term, articles) {
    console.log('Searching for term:', term);
    console.log('Number of articles to search:', Object.keys(articles).length);

    const results = [];
    const articleNumber = parseInt(term);

    if (!isNaN(articleNumber) && articles[articleNumber]) {
        const article = articles[articleNumber];
        results.push({
            articleNumber: articleNumber,
            title: article.title,
            clauses: article.clauses
        });
    } else {
        for (const [articleNum, article] of Object.entries(articles)) {
            if (article.title.toLowerCase().includes(term.toLowerCase())) {
                results.push({
                    articleNumber: parseInt(articleNum),
                    title: article.title,
                    clauses: article.clauses
                });
            }
            for (const [clauseNum, content] of Object.entries(article.clauses)) {
                if (content.toLowerCase().includes(term.toLowerCase())) {
                    results.push({
                        articleNumber: parseInt(articleNum),
                        title: article.title,
                        clauseNumber: parseInt(clauseNum),
                        content: content
                    });
                }
            }
        }
    }

    console.log('Number of search results:', results.length);
    return results;
}

// Update the displayResults function to handle the new result structure
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

        if ('clauses' in result && !('clauseNumber' in result)) {
            // Display entire article
            resultItem.innerHTML = `<h3>Article ${result.articleNumber}: ${result.title}</h3>`;
            for (const [clauseNum, content] of Object.entries(result.clauses)) {
                resultItem.innerHTML += `
                <p><strong>(${clauseNum})</strong> ${content}</p>`;
            }
        } else {
            // Display individual clause match
            const highlightedContent = result.content.replace(
                new RegExp(searchTerm, 'gi'),
                '<strong>$&</strong>'
            );
            resultItem.innerHTML = `
                <h3>Article ${result.articleNumber}: ${result.title}</h3>
                <p><strong>(${result.clauseNumber})</strong> ${highlightedContent}</p>
            `;
        }

        resultsDiv.appendChild(resultItem);
    });
}




document.getElementById('searchButton').addEventListener('click', async function() {
    const searchTerm = document.getElementById('searchQuery').value;
    if (searchTerm) {
        try {
            document.getElementById('loadingDiv').style.display = 'block';
            const { articles } = await loadPdf();
            if (Object.keys(articles).length === 0) {
                throw new Error('No articles were parsed from the PDF');
            }
            const results = searchConstitution(searchTerm, articles);
            displayResults(results, searchTerm);
        } catch (error) {
            console.error('Error during search:', error);
            alert('An error occurred while searching: ' + error.message);
        } finally {
            document.getElementById('loadingDiv').style.display = 'none';
        }
    } else {
        alert('Please enter a search term or article number.');
    }
});

document.getElementById('googleButton').addEventListener('click', function() {
    const searchTerm = document.getElementById('searchQuery').value;
    if (searchTerm) {
        const query = `Ugandan law on article(s) ${searchTerm}`;
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(googleSearchUrl, '_blank');
    } else {
        alert('Please enter a search term.');
    }
});

function openPdfAtPage(pageNumber) {
    const pdfUrl = 'Constitution of the Republic of Uganda.pdf';
    const pdfWithPage = `${pdfUrl}#page=${pageNumber}`;
    window.open(pdfWithPage, '_blank');
}