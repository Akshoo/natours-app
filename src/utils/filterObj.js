const filterObj = (obj, ...allowed) => {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
        if (allowed.includes(key)) newObj[key] = obj[key];
    });
    return newObj;
};

export default filterObj;
