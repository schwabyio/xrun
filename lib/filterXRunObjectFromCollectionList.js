////////////////////////////////////////////////////////////////////////////////
//   filterXRunObjectFromCollectionList.js - Filter xRunObject from csv.      //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const filterXRunObjectFromCollectionList = async function filterXRunObjectFromCollectionList(xRunObject, collectionCSVList) {
    const collectionList = collectionCSVList.replace(/\s/g,'').split(',')
    let collectionFoundFlag = false
    let notFoundCollectionList = []
    let collectionIndex = 0

    //First confirm that each collection in collectionList exists in xRunObject
    for (const collectionName of collectionList) {
        //Reset collectionFoundFlag
        collectionFoundFlag = false

        xRunObject.postmanCollections.forEach(function (postmanCollection) {
        if (postmanCollection.collection.info.name === collectionName) {
            collectionFoundFlag = true
        }
        })

        if (collectionFoundFlag === false) {
        notFoundCollectionList.push(collectionName)
        }
    }

    //Throw error for any collections not found
    if (notFoundCollectionList.length > 0) {
      throw new Error("Oops, the following provided collections were not found within the provided xRunProjectPath: " + notFoundCollectionList.toString())
    }

    //Remove all collections in xRunObject not provided within collectionList (iterate in reverse to delete array items)
    collectionIndex = xRunObject.postmanCollections.length
    while (collectionIndex--) {
      //Reset collectionFoundFlag
      collectionFoundFlag = false

      for (const collectionName of collectionList) {
        if (xRunObject.postmanCollections[collectionIndex].collection.info.name === collectionName) {
            collectionFoundFlag = true
        }
      }

      //If collection not found delete from xRunObject
      if (collectionFoundFlag === false) {
        xRunObject.postmanCollections.splice(collectionIndex, 1)
      }
    }
}

module.exports = filterXRunObjectFromCollectionList