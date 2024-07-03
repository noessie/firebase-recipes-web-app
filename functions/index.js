const FirebaseConfig = require("./FirebaseConfig");
const recipesApi = require("./recipesApi");
const punycode = require("punycode/");
const functions = FirebaseConfig.functions;
const firestore = FirebaseConfig.firestore;
const storageBucket = FirebaseConfig.storageBucket;
const admin = FirebaseConfig.admin;

exports.api= functions.https.onRequest(recipesApi);
exports.onCreateRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onCreate(async (snapshot) => {
    const countDocRef = firestore.collection("recipesCounts").doc("all");
    const countDoc = await countDocRef.get();

    if (countDoc.exists) {
      countDocRef.update({ count: admin.firestore.FieldValue.increment(1) });
    } else {
      countDocRef.set({ count: 1 });
    }

    const recipe = snapshot.data();

    if (recipe.isPublished) {
      const countPublishedDocRef = firestore
        .collection("recipesCounts")
        .doc("published");
      const countPublishedDoc = await countPublishedDocRef.get();

      if (countPublishedDoc.exists) {
        countPublishedDocRef.update({
          count: admin.firestore.FieldValue.increment(1),
        });
      } else {
        countPublishedDocRef.set({ count: 1 });
      }
    }
  });

exports.onDeleteRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onDelete(async (snapshot) => {
    const recipe = snapshot.data();
    const imageUrl = recipe.imageUrl;
    if (imageUrl) {
      const decodedImageUrl = decodeURIComponent(imageUrl);
      const startIndex = decodedImageUrl.indexOf("/o/") + 3;
      const endIndex = decodedImageUrl.indexOf("?", startIndex);
      const imagePath = decodedImageUrl.substring(startIndex, endIndex);
      const file = storageBucket.file(imagePath);
      console.log(`Attempting to delete image at path: ${imagePath}`);
      try {
        await file.delete();
        console.log("Image deleted successfully");
      } catch (error) {
        console.error(`Failed to delete image at path: ${error.message}`);
      }
      const countDocRef = firestore.collection("recipesCounts").doc("all");
      const countDoc = await countDocRef.get();

      if (countDoc.exists) {
        countDocRef.update({ count: admin.firestore.FieldValue.increment(-1) });
      } else {
        countDocRef.set({ count: 0 });
      }

      const recipe = snapshot.data();

      if (recipe.isPublished) {
        const countPublishedDocRef = firestore
          .collection("recipesCounts")
          .doc("published");
        const countPublishedDoc = await countPublishedDocRef.get();

        if (countPublishedDoc.exists) {
          countPublishedDocRef.update({
            count: admin.firestore.FieldValue.increment(-1),
          });
        } else {
          countPublishedDocRef.set({ count: 0 });
        }
      }
    }
  });

exports.onUpdateRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onUpdate(async (changes) => {
    const oldRecipe = changes.before.data();
    const newRecipe = changes.after.data();
    let publishedCount = 0;
    if (!oldRecipe.isPublished && newRecipe.isPublished) {
      publishedCount += 1;
    } else if (oldRecipe.isPublished && !newRecipe.isPublished) {
      publishedCount -= 1;
    }
    if (publishedCount !== 0) {
      const countPublishedDocRef = firestore
        .collection("recipesCounts")
        .doc("published");
      const countPublishedDoc = await countPublishedDocRef.get();
      if (countPublishedDoc.exists) {
        countPublishedDocRef.update({
          count: admin.firestore.FieldValue.increment(publishedCount),
        });
      } else {
        if (publishedCount > 0) {
          countPublishedDocRef.set({ count: publishedCount });
        } else {
          countPublishedDocRef.set({ count: 0 });
        }
      }
    }
  });

const runtimeOptions = {
  timeoutSeconds: 300,
  memory: "256MB",
};

exports.dailyCheckRecipePublishDate = functions
  .runWith(runtimeOptions)
  .pubsub.schedule(" 0 0 * * * ")
  .onRun(async () => {
    console.log("Running daily check for recipe publish date");
    const snapshot = await firestore
      .collection("recipes")
      .where("isPublished", "==", false)
      .get();

    snapshot.forEach(async (doc) => {
      const data = doc.data();
      const now = Date.now() / 1000;
      const isPublished = data.publishDate._seconds <= now ? true : false;
      if (isPublished) {
        console.log(`Publishing recipe: ${data.name}`);
        firestore
          .collection("recipes")
          .doc(doc.id)
          .set({ isPublished: true }, { merge: true });
      }
    });
  });

console.log("server is running...");
