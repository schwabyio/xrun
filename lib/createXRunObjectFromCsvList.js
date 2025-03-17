////////////////////////////////////////////////////////////////////////////////
//   createXRunObjectFromCsvList.js - Create xRunObject from csvList.         //
//                                                                            //
//                Created by: schwaby.io                                      //
////////////////////////////////////////////////////////////////////////////////
const path = require('node:path')

const getDirectoryNameList = require('./getDirectoryNameList')
const getXRunDirectoryPathList = require('./getXRunDirectoryPathList')
const createXRunObjectFromPostmanList = require('./createXRunObjectFromPostmanList')
const getAllPostmanFilePathList = require('./getAllPostmanFilePathList')


////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////
const createXRunObjectFromCsvList = async function createXRunObjectFromCsvList(settings, csvList) {

    try {
        //Get a list of all directory names for project (no excluding)
        const allProjectDirectoryNameList = await getDirectoryNameList(settings.xRunProjectPath)

        /* If a name from the csvList matches a directory it will get added to splitCsvObject.directoryNameList,
        otherwise it will get added to splitCsvObject.collectionNameList. No errors thrown yet if something
        does not exist. */
        const splitCsvObject = splitCsvIntoObject(allProjectDirectoryNameList, csvList)

        //Get allXrunDirectoryPathList - including excluded
        const allXrunDirectoryPathList = await getXRunDirectoryPathList(settings, false)

        //Get all postman file paths for entire project - including excluded (from above) - do not throw error on empty directory
        const allPostmanFilePathList = await getAllPostmanFilePathList(allXrunDirectoryPathList, false)

        //Get postmanFilePaths for splitCsvObject.directoryNameList - throw error if directory does not contain any postman tests
        const csvDirectoryPostmanFilePathList = await getAllPostmanFilePathList(splitCsvObject.directoryNameList, true)

        //Get postmanFilePaths for splitCsvObject.collectionNameList using allPostmanFilePathList - throw error if collectionName does not exist (will need to run all postman files from these)
        const csvCollectionNamePostmanFilePathList = getPostmanFilePathsForCollectionNameList(splitCsvObject.collectionNameList, allPostmanFilePathList)

        const csvFinalPostmanFilePathList = combineLists(csvDirectoryPostmanFilePathList, csvCollectionNamePostmanFilePathList)

        //get getPostmanFile(filePath) for all postmanFilePaths / and/or createXRunObject(postmanFileList) NEW

        const xRunObject = createXRunObjectFromPostmanList(settings, csvFinalPostmanFilePathList)

        return xRunObject
    } catch (error) {
        throw error
    }

    function splitCsvIntoObject(allProjectDirectoryList, csvList) {
        const splitCsvObject = {}
        splitCsvObject.directoryNameList = []
        splitCsvObject.collectionNameList = []

        const fullList = csvList.replace(/\s/g,'').split(',')

        for (item of fullList) {

            //Add matching directoryName to splitCsvObject.directoryNameList
            let directoryNameMatchFlag = false
            for (directoryName of allProjectDirectoryList) {
                //Must be a directoryName
                if (directoryName === item) {
                    splitCsvObject.directoryNameList.push(item)
                    directoryNameMatchFlag = true
                }
            }

            //Must be a collectionName
            if (directoryNameMatchFlag === false) {
                splitCsvObject.collectionNameList.push(item)
            }
        }

        return splitCsvObject
    }


    function getPostmanFilePathsForCollectionNameList(collectionNameList, allPostmanFilePathList) {
        const postmanFilePathsFromCollectionNames = []

        for (const collectionName of collectionNameList) {
            let postmanNameFoundFlag = false

            for (const postmanFilePath of allPostmanFilePathList) {
                const postmanName = path.basename(postmanFilePath, '.postman_collection.json')

                if (collectionName === postmanName) {
                    postmanFilePathsFromCollectionNames.push(postmanFilePath)

                    //Update found flag
                    postmanNameFoundFlag = true
                }
            }

            if (postmanNameFoundFlag === false) {
                throw new Error(`Oops, unable to locate provided collectionName: ${collectionName}`)
            }
        }

        return postmanFilePathsFromCollectionNames
    }


    function combineLists(list1, list2) {
        const combinedLists = []

        for (const list1Item of list1) {
            combinedLists.push(list1Item)
        }

        for (const list2Item of list2) {
            combinedLists.push(list2Item)
        }

        return combinedLists
    }
}

module.exports = createXRunObjectFromCsvList