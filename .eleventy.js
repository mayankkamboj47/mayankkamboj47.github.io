const katex = require('katex');

module.exports = function(eleventyConfig){
    eleventyConfig.addPassthroughCopy('img');
    eleventyConfig.addFilter('humanise', function(dateString){
        const date = new Date(dateString);
        const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
                       'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]
        return `${month} ${date.getDate()}, ${date.getFullYear()}`;
    });
    eleventyConfig.addFilter('latex', function(rawString){
        return rawString.replace(/\$(.+?)\$/g, (_, equation) => {
            const cleanEquation = equation.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            return katex.renderToString(cleanEquation, { throwOnError: false });
        });
    });
}