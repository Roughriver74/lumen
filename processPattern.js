// Code to process pattern in text
module.exports = async function(items) {
    // Function to escape special characters in the pattern
    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // Create the pattern based on the example
    const patternTemplate = '{time:b,date:"[^"]+",city:"[^"]+",facebook:a,vk:"[^"]+",buy:"[^"]+",order:a}';
    const pattern = new RegExp(patternTemplate, 'g');

    try {
        // Process each input item
        const returnItems = [];
        
        // Process each input item
        for (const item of items) {
            const inputText = item.json?.data || '';
            
            // Find all matches
            const matches = [...inputText.matchAll(pattern)];
            
            // Process each match into a clean JSON object
            for (const match of matches) {
                const matchText = match[0];
                
                // Extract values using regex
                const dateMatch = matchText.match(/date:"([^"]+)"/);
                const cityMatch = matchText.match(/city:"([^"]+)"/);
                const vkMatch = matchText.match(/vk:"([^"]+)"/);
                const buyMatch = matchText.match(/buy:"([^"]+)"/);
                
                // Create clean object
                returnItems.push({
                    json: {
                        time: 'b',
                        date: dateMatch ? dateMatch[1] : '',
                        city: cityMatch ? cityMatch[1] : '',
                        facebook: 'a',
                        vk: vkMatch ? vkMatch[1].replace(/\\u002F/g, '/') : '',
                        buy: buyMatch ? buyMatch[1].replace(/\\u002F/g, '/') : '',
                        order: 'a'
                    }
                });
            }
        }
        
        return returnItems;
    } catch (error) {
        // Handle any errors by returning a single item with error information
        return [{
            json: {
                error: error.message,
                success: false
            }
        }];
    }
}

// For testing purposes
// const testData = [{
//     json: {
//         data: 'some text {time:b,date:"2025-11-15 00:00:00",city:"Йошкар-Ола | Stone Club",facebook:a,vk:"https:\\u002F\\u002Fvk.com\\u002Fstigmatayola2025",buy:"https:\\u002F\\u002Fcbiletom.ru\\u002Fevent.php?event=9382",order:a}'
//     }
// }];
// console.log(JSON.stringify(module.exports(testData), null, 2));
