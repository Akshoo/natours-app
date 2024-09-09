export default class APIFeatures {
    constructor(reqQuery, query) {
        this.reqQuery = reqQuery;
        this.query = query;
    }
    filter() {
        let queryObj = { ...this.reqQuery };
        const excludeFields = ['sort', 'page', 'limit', 'fields'];
        excludeFields.forEach((fi) => {
            delete queryObj[fi];
        });

        queryObj = JSON.parse(
            JSON.stringify(queryObj).replace(
                /\b(gt|gte|lt|lte)\b/g,
                (match) => `$${match}`
            )
        );

        this.query = this.query.find(queryObj);
        return this;
    }
    sort() {
        if (this.reqQuery.sort) {
            const sortFields = this.reqQuery.sort.replaceAll(',', ' ');
            this.query = this.query.sort(sortFields);
        } else this.query = this.query.sort('createdAt -ratingsAverage');

        return this;
    }
    limit() {
        if (this.reqQuery.fields) {
            const projectFields = this.reqQuery.fields.replaceAll(',', ' ');
            this.query = this.query.select(projectFields);
        } else this.query = this.query.select('-__v -secret');

        return this;
    }
    paginate() {
        const limit = +this.reqQuery.limit || 100;
        const page = this.reqQuery.page || 1;
        const skip = (page - 1) * limit;
        // const docLength = await Tour.countDocuments();

        // if (skip >= docLength)
        //     throw new Error(
        //         'No record found for this page'
        //     );
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
