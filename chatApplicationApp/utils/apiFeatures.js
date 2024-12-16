class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    const queryObj = { ...this.queryStr };
    const queryEle = ["page", "sort", "limit", "fields"];
    queryEle.forEach((el) => delete queryObj[el]);
    // advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|eq|ne)\b/g,
      (match) => `$${match}`
    );

    if (this.query.op === "countDocuments") {
      this.query = this.query.countDocuments(JSON.parse(queryStr));
    } else {
      this.query = this.query.find(JSON.parse(queryStr));
    }

    return this;
  }

  sorting() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  field() {
    if (this.queryStr.fields) {
      const fieldBy = this.queryStr.fields.split(",").join(" ");

      this.query = this.query.select(fieldBy);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paging() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 50;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
