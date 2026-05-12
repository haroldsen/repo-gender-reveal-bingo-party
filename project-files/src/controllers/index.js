
// Route handlers for static pages

const homePage = (req, res) => {
    res.render('index', { title: 'Gender Reveal Bingo Party | Home', bodyClass: 'index' });
};

const aboutPage = (req, res) => {
    res.render('about', { title: 'About | Gender Reveal Bingo Party' });
};

const getCardsPage = (req, res) => {
    res.render('get-cards', { title: 'Get Cards | Gender Reveal Bingo Party', bodyClass: 'get-cards' });
};

const contactUsPage = (req, res) => {
    res.render('contact-us', { title: 'Contact Us | Gender Reveal Bingo Party', bodyClass: 'contact-us' });
};

const introVideoPage = (req, res) => {
    res.render('intro-video', { title: 'Intro Video | Gender Reveal Bingo Party', bodyClass: 'intro-video' });
};

const playableBingoCardPage = (req, res) => {
    res.render('bingo-card', { title: 'Playable Card | Gender Reveal Bingo Party', bodyClass: 'bingo-card-main' });
};

const testErrorPage = (req, res, next) => {
    const err = new Error('This is a test error');
    err.status = 500;
    next(err);
};

export { homePage, aboutPage, getCardsPage, contactUsPage, testErrorPage, introVideoPage, playableBingoCardPage };
