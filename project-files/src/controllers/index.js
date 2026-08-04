
const price = process.env.PRICE_FOR_DISPLAY || '$';

// Route handlers for static pages

const homePage = (req, res) => {
    res.render('index', {
        title: 'Gender Reveal Bingo Party | Home',
        mainClass: 'index',
        price: price
    });
};

const howToPage = (req, res) => {
    res.render('how-to-host', {
        title: 'How to Host | Gender Reveal Bingo Party',
        mainClass: 'how-to-main',
        price: price
    });
};

const contactUsPage = (req, res) => {
    res.render('contact-us', { title: 'Contact Us | Gender Reveal Bingo Party', mainClass: 'contact-us' });
};

const introVideoPage = (req, res) => {
    res.render('intro-video', { title: 'Intro Video | Gender Reveal Bingo Party', mainClass: 'intro-video' });
};

const playableBingoCardPage = (req, res) => {
    res.render('bingo-card', { title: 'Playable Card | Gender Reveal Bingo Party', mainClass: 'bingo-card-main' });
};

const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

export {
    homePage,
    howToPage,
    contactUsPage,
    testErrorPage,
    introVideoPage,
    playableBingoCardPage
};
