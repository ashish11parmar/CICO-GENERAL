import { Injectable } from '@angular/core';
import { config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private indexedDb: IDBDatabase;
  private request: IDBOpenDBRequest
  constructor() { }

  /**
   * Check if database is exist or not.
   */
  async isDatabaseExist() {
    if (window.indexedDB.databases) { /** @note Firefox change need to check if databases (key) exist or not in . */
      return (await window.indexedDB.databases()).map(db => db.name).includes(config.indexedDbDatabaseName);
    } else {
      return false
    }
  }

  /**
   * Open Indexed database and create object-store.
   * @returns 
   */
  openDatabase() {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open(config.indexedDbDatabaseName);
      this.request.onsuccess = (event: any) => {
        this.indexedDb = event.target.result;
        return resolve(true);
      }

      this.request.onerror = (error) => {
        console.error("Indexed db connection error : ", error);
        return reject(false);
      }

      this.request.onupgradeneeded = (event) => {
        const db = this.request.result;
        const store = db.createObjectStore("logs", { keyPath: "uuid" });
        store.createIndex("dateFilter", ["unixTime"], { unique: false });
        store.createIndex('email', 'email', { unique: false });
      }
    })
  }

  /**
   * @param logs tobe added in indexed-db (last 2 months data + latest data from Sheets.)
   * @returns 
   */
  addLogsToIndexedDb(logs: any) {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open(config.indexedDbDatabaseName);
      this.request.onsuccess = (event: any) => {
        const db = this.request.result;
        const transaction = db.transaction("logs", "readwrite");
        const store = transaction.objectStore("logs");

        for (let i = 0; i < logs.length; i++) {
          if (logs[i].date === '05/09/2023' && logs[i].email === 'pooja@raoinformationtechnology.com') {
            console.log("ONE USER SINGLE OBJECT", logs[i])
          }
          store.put(logs[i]);
        }

        transaction.oncomplete = (event) => {
          return resolve(event);
        };

        transaction.onerror = (error) => {
          console.log("IS THERE ANY ERROR", error)
          return reject(error);
        }
      }

      this.request.onerror = (error) => {
        console.log("ANOTHER ERROR", error)
        return reject(error);
      }
    })
  }

  /**
   * @param startDate 
   * @param endDate 
   * @returns filtered Logs from indxed-db with given date-range.
   */
  getLogs(startDate: string, endDate: string) {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open(config.indexedDbDatabaseName);
      this.request.onsuccess = (event: any) => {
        const db = this.request.result;
        const transaction = db.transaction("logs", "readwrite");
        const store = transaction.objectStore("logs");
        const dateRange = store.index("dateFilter");
        var bounds = IDBKeyRange.bound([startDate], [endDate]);
        const dateRangeQuery = dateRange.getAll(bounds);
        dateRangeQuery.onsuccess = (query) => {
          return resolve(dateRangeQuery.result);
        };

        dateRangeQuery.onerror = (error) => {
          return reject(error);
        };
      }

      this.request.onerror = (error) => {
        return reject(error);
      }
    })
  }

  /**
   * 
   * @param email 
   * @returns 
   */
  getDataByEmailAndDateRange(email: string) {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open(config.indexedDbDatabaseName);
      this.request.onsuccess = (event: any) => {
        const db = this.request.result;
        const transaction = db.transaction("logs", "readwrite");
        const store = transaction.objectStore("logs");
        const emailIndex = store.index("email");
        const getAllEmail = emailIndex.getAll(email);
        const results: any[] = [];

        getAllEmail.onsuccess = (query) => {
          return resolve(getAllEmail.result);
        };

        getAllEmail.onerror = (error) => {
          return reject(error);
        };

        // let keyRange = IDBKeyRange.bound([dateRange.startDate], [dateRange.endDate]);
        // emailIndex.openCursor(keyRange).onsuccess = (event) => {
        //   const cursor = (event.target as any).result;
        //   if (cursor) {
        //     if (cursor.value.email === email) {
        //       results.push(cursor.value);
        //     }
        //     cursor.continue();
        //   } else {
        //     resolve(results);
        //   }
        // };
      }

      this.request.onerror = (error) => {
        return reject(error);
      }
    })
  }

  deleteRegularizeOldData(userUuid: any) {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open(config.indexedDbDatabaseName);
      this.request.onsuccess = (event: any) => {
        const db = this.request.result;
        const transaction = db.transaction("logs", "readwrite");
        const store = transaction.objectStore("logs");
        userUuid.forEach(function (uuid: any) {
          console.log("result::", uuid);
          var getRequest = store.get(uuid);
          getRequest.onsuccess = function (event: any) {
            var result = event.target.result;
            if (result) {
              var deleteRequest = store.delete(uuid);
              deleteRequest.onsuccess = function (result) {
                console.log("Successfully deleted data with UUID: ", uuid);
              }
              deleteRequest.onerror = function (result) {
                console.log("Data not deleted with UUID: ", uuid);
              }
            }
          }
        })
        resolve(true);
      }
      this.request.onerror = (error) => {
        return reject(error);
      }
    })
  }

  /**
   * @note Inorder to get latest logs from sheet need to get last added log in indxed-db
   * @note And get last added logs date.
   */
  getLastLog() {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open(config.indexedDbDatabaseName);
      this.request.onsuccess = (event: any) => {
        const db = this.request.result;
        const transaction = db.transaction("logs", "readwrite");
        const store = transaction.objectStore("logs");
        const corsorRequest = store.openCursor(null, 'prev');
        corsorRequest.onsuccess = (_event: any) => {
          const cursor = _event.target.result;
          if (cursor) {
            const logData = cursor.value;
            cursor.continue();
            return resolve(cursor.value);
          } else { /** @note No logs to iterate throug */
            return resolve([]);
          }
        };

        corsorRequest.onerror = (error) => {
          return reject(error);
        }
      }

      this.request.onerror = (error) => {
        return reject(error);
      }
    })
  }

  /**
   * Delete Indexed-db while Logout from Admin panel.
   * @returns 
   */
  deleteIndexedDb() {
    return new Promise((resolve, reject) => {
      this.request = window.indexedDB.open(config.indexedDbDatabaseName);
      this.request.onsuccess = (event: any) => {
        const db = event.target.result;
        if (db) {
          db.close(); /** @note Close the database connection first */
          window.indexedDB.deleteDatabase(config.indexedDbDatabaseName)
            .onsuccess = () => {
              return resolve(true);
            };
        }
      }
      this.request.onerror = (error) => {
        return reject(error);
      }
    })
  }
}
