import { Router } from "express";

import PDFDocument from 'pdfkit';
import SVGtoPDF from 'svg-to-pdfkit';

const winningCardRoute = Router();

winningCardRoute.get('/:gameId', (req, res) => {
    try {
        // 1. Create your SVG string dynamically (or load it from a file/database)
        const svgString = `
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="80" fill="#3498db" />
                <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Helvetica">
                    Hello Node!
                </text>
            </svg>
        `;

        // 2. Initialize a PDFKit Document
        const doc = new PDFDocument({ size: 'A4' });

        // 3. Set HTTP headers to force file download in the browser
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="generated-vector.pdf"');

        // 4. Pipe the PDF document directly into the Express response stream
        doc.pipe(res);

        // 5. Convert the SVG string and draw it onto the PDF document
        // Parameters: (pdfDoc, svgString, x_position, y_position, options)
        SVGtoPDF(doc, svgString, 100, 100, {
            width: 300,  // Scale width inside the PDF
            height: 300, // Scale height inside the PDF
            preserveAspectRatio: 'xMidYMid meet'
        });

        // 6. Finalize the PDF file and close the stream
        doc.end();

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('An error occurred while generating your PDF.');
    }
});

export default winningCardRoute;
