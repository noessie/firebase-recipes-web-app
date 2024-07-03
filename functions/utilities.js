const authorizeUser = async (authorizationHeader, firebaseAuth) => {
    if (!authorizationHeader) {
        //eslint-disable-next-line no-throw-literal
        throw 'No authorization provided';
    }
    const token = authorizationHeader.split('')[1];
    try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);
        
    } catch (error) {
     
        throw (error);
    }
};

const validateRecipePostPut = (newRecipe) => { 
    let missingFields = "";
    if (!newRecipe) {
        missingFields += "recipe";
        return missingFields;
    }

    if (!newRecipe.name) {
        missingFields += "name";
    }

    if (!newRecipe.directions) {
        missingFields += "directions";
    }

    if (!newRecipe.ingredients || newRecipe.ingredients.length === 0) {
        missingFields += "ingredients";
    }
    
    if (newRecipe.isPublished !== true && !newRecipe.isPublished !== false) {
        missingFields += "isPublished";
    }

    if (!newRecipe.category) {
        missingFields += "category";
    }

    if(!newRecipe.publishDate) {
        missingFields += "publishDate";
    }

    if (!newRecipe.imageUrl) {
        missingFields += "imageUrl";
    }

    return missingFields;
}

const sanitizeRecipePostPut = (newRecipe) => {
    const recipe = {};
        recipe.name = newRecipe.name,
        recipe.directions = newRecipe.directions,
        recipe.ingredients = newRecipe.ingredients,
        recipe.isPublished = newRecipe.isPublished,
        recipe.category = newRecipe.category,
        recipe.publishDate = newDate(newRecipe.publishDate * 1000),
        recipe.imageUrl = newRecipe.imageUrl
    
    return recipe;
}



module.exports = {authorizeUser, validateRecipePostPut, sanitizeRecipePostPut};