class APIFunctionality {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search(searchFields = ["title"]) {
    if (this.queryStr.keyword) {
      const keyword = this.queryStr.keyword;

      const searchConditions = searchFields.map((field) => ({
        [field]: {
          $regex: keyword,
          $options: "i",
        },
      }));

      this.query = this.query.find({
        $or: searchConditions,
      });
    }

    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    // Handle tagSize conversion
    if (queryCopy.tagSize) {
      // Supports comma-separated multi-select e.g., ?tagSize=M,L
      const sizes = queryCopy.tagSize.split(",");
      queryCopy["sizing.tagSize"] = { $in: sizes };
      delete queryCopy.tagSize;
    }

    // Remove control fields
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);

    // Convert comparison operators for price/ratings
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = APIFunctionality;
