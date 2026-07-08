import { Router } from "express";

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

import { getGameById } from "../../../models/games/games.js";
import { getCardById } from "../../../models/card-data/card-data.mjs";

const winningCardRoute = Router();

winningCardRoute.get('/:gameId', async (req, res) => {
    let browser;
    try {
        const { gameId } = req.params;

        const game = await getGameById(gameId);
        if (!game || !game.lastWinningCard) {
            return res.status(404).send('Winning card not found for this game.');
        }

        const card = getCardById(game.lastWinningCard.id);
        const winningSequence = game.lastWinningCard.sequence;
        const svgString = card.getToggledSVG(winningSequence);

        // 1. Read your local Lexend font file and convert it to Base64
        const fontPath = path.resolve('./Lexend/Lexend-VariableFont_wght.ttf');
        const fontBase64 = fs.readFileSync(fontPath).toString('base64');

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // 2. Inject the font directly via Base64 src data URI
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @font-face {
                        font-family: 'Lexend';
                        src: url(data:font/ttf;charset=utf-8;base64,${fontBase64}) format('truetype');
                    }
                    body, html {
                        margin: 0;
                        padding: 0;
                        background: transparent;
                        overflow: hidden;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        width: 100vw;
                    }
                    svg {
                        width: 100%;
                        height: 100%;
                    }
                </style>
            </head>
            <body>
                ${svgString}
            </body>
            </html>
        `;

        // 3. Changed to 'load' instead of 'networkidle0'
        // Since the font is inline, there are 0 external network requests needed.
        await page.setContent(htmlContent, { 
            waitUntil: 'load' 
        });

        const pdfBuffer = await page.pdf({
            width: '360pt',
            height: '504pt',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="winning-card.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PDF with Puppeteer:', error);
        res.status(500).send('An error occurred while generating your PDF.');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

export default winningCardRoute;
