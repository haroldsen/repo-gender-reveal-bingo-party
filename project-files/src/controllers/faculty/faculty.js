
import { getFacultyBySlug, getSortedFaculty } from '../../models/faculty/faculty.js';

// Route handler for the faculty list page
const facultyListPage = async (req, res) => {

    // Handle sorting if requested
    const sortBy = req.query.sort || 'name';

    const faculty = await getSortedFaculty(sortBy);

    res.render('faculty/list', {
        title: 'Faculty',
        faculty: faculty
    });
};

// Route handler for individual faculty detail pages
const facultyDetailPage = async (req, res, next) => {
    const facultySlug = req.params.facultySlug;
    const member = await getFacultyBySlug(facultySlug);

    // If the faculty member doesn't exist, create 404 error
    if (Object.keys(member).length === 0) {
        const err = new Error(`Faculty ${facultySlug} not found`);
        err.status = 404;
        return next(err);
    }

    // Render the individual faculty detail page
    res.render('faculty/detail', {
        title: `${member.id} - ${member.name}`,
        faculty: member
    });
};

export { facultyListPage, facultyDetailPage };
