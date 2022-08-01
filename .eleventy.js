module.exports = function(eleventyConfig){
    eleventyConfig.addFilter('humanise', function(dateString){
        const date = new Date(dateString);
        const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
                       'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]
        return `${month} ${date.getDate()}, ${date.getFullYear()}`;
    })
}