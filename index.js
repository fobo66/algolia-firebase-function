//    Copyright 2017 Andrey Mukamolow <fobo66@protonmail.com>
//    Forked by David Silva <d.alex.sit@hotmail.com>
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

/**
 * If a patch updates a nested object,
 * it's necessary to parse it to an array
 * @param {*} dataVal - a JavaScript value from a DataSnapshot
 * @returns {boolean} - if the object is nested or not
 */
const hasManyObjects = (dataVal) => {
    const val = Object.keys(dataVal).map(function(key) {
        return dataVal[key];
    });
    return val[0] instanceof Object;
  };
  
  /**
   * Forging object for uploading to Algolia
   * Algolia requires "objectID" field in every object
   * If not specified, it will generate it automatically
   * To keep objects in sync, we specify objectID by ourselves
   *
   * @param {functions.firestore.DocumentSnapshot} DocumentSnapshot - Child DocumentSnapshot
   */
  const prepareObjectToExporting = (DocumentSnapshot) => {
    const snapVal = DocumentSnapshot.data();
    if (hasManyObjects(snapVal)) {
      return Object.entries(snapVal).map(o => Object.assign({ objectID: o[0] }, o[1]));
    }
    const object = snapVal;
    object.objectID = DocumentSnapshot.id;
    return [object];
  };
  
  /**
   * Promisified version of Algolia's SDK function
   * Firebase firestore Cloud Functions by default should return Promise object
   * So, for usability, we return Promise too
   * @param {functions.firestore.DataSnapshot} DocumentSnapshot - Child snapshot
   * @param {algolia.AlgoliaIndex} index - Algolia index
   */
  const updateExistingOrAddNew = (DocumentSnapshot, index) => index.saveObjects(prepareObjectToExporting(DocumentSnapshot));
  
  /**
   * Promisified version of Algolia's SDK function
   * Firebase firestore Cloud Functions by default should return Promise object
   * So, for usability, we return Promise too
   * @param {functions.firestore.DataSnapshot} DocumentSnapshot - Child snapshot
   * @param {algolia.AlgoliaIndex} index - Algolia index
   */
  const removeObject = (DocumentSnapshot, index) => {
    return index.deleteObjects(DocumentSnapshot.key);
  };
  
  /**
   * Determine whether it's deletion or update or insert action
   * and send changes to Algolia
   * Firebase firestore Cloud Functions by default should return Promise object
   * So, for usability, we return Promise too
   * @param {algolia.AlgoliaIndex} index - Algolia index
   * @param {functions.Change} change - Cloud Firestore change
   */
  exports.syncAlgoliaWithFirebase = (index, change) => {
    if (!change.after.exists) {
      return removeObject(change.before, index);
    }
  
    return updateExistingOrAddNew(change.after, index);
  };
  
