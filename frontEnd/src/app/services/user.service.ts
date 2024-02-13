import { Injectable, NgModule } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, observable, Observable, Subject, take } from 'rxjs';
import { Users } from '../model/data-model.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject: BehaviorSubject<any>;
  currentUser: Observable<any>;
  private loggedInUser = new Subject<any>();
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private _snackBar: MatSnackBar
  ) {

    this.currentUserSubject = new BehaviorSubject<any>(localStorage.getItem('currentUser'));
    this.currentUser = this.currentUserSubject.asObservable();
  }


  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  /**
   * @note remove currentUserSubject from the Session.
   * Inorder to prevent login page from browser back button
   */
  setLoggedInUser(userName: any) {
    this.currentUserSubject.next(userName)
  }


  //retrieves users from firestore database
  getUsers(): Observable<any> {
    // return new Observable<any>((observer) => {
    //   this.afs.collection('Users')
    //     .snapshotChanges().subscribe(data => {
    //       console.log("THIS IS DATA", data);
    //       observer.next(data)
    //     });
    // })
    return new Observable<any>((observer) => {
      this.afs.collection('Users')
        .snapshotChanges().pipe(take(1)).subscribe(data => {
          console.log("THIS IS DATA", data);
          observer.next(data)
        });
    })
  }
  getLoggedInUser(): Observable<any> {
    return this.loggedInUser.asObservable();
  }



  /**
   * 
   * @param email 
   * @param password 
   * @returns 
   * 
   * @deprecated
   */
  signIn(email: string, password: string): Observable<any> {
    return new Observable<any>((observer) => {
      this.afAuth.signInWithEmailAndPassword(email, password)
        .then(async (userDetails: any) => {
          let idToken = '';
          this.afs.collection('admin', ref => ref.where('email', '==', email))
            .snapshotChanges().pipe(take(1)).subscribe(data => {
              console.log("DATA OF ADMIN COLLECTIONS", data)
              if (data && data.length) {
                let idToken = '';
                userDetails.user.getIdToken()
                  .then((token: any) => {
                    idToken = token;
                    localStorage.setItem('currentUser', (userDetails.user.email));
                    localStorage.setItem('token', token)
                    this.currentUserSubject.next(userDetails.user.email)
                    this.loggedInUser.next({ currentUser: userDetails.user.email })
                    console.log("TOKEN OF FIREBASE", idToken);
                    // return
                    console.log("inside SignIn", userDetails);
                    observer.next(userDetails);
                    observer.complete();
                  })
              } else {
                observer.next(null);
                observer.complete();
              }
            })
          // userDetails.user.getIdToken()
          //   .then((token: any) => {
          //     idToken = token;
          //     localStorage.setItem('currentUser', (userDetails.user.email));
          //     localStorage.setItem('token', token)
          //     this.currentUserSubject.next(userDetails.user.email)
          //     this.loggedInUser.next({ currentUser: userDetails.user.email })
          //     console.log("TOKEN OF FIREBASE", idToken);
          //     // return
          //     console.log("inside SignIn", userDetails);
          //     observer.next(userDetails);
          //     observer.complete();
          //   })
          // // this.currentUserSubject.next(userDetails.user.email);

        })
        .catch((error) => {
          window.alert(error);
        });
    })
    // this.afs.collection(`Logs`).add(logs);
  }

  signOut(): Observable<any> {
    return new Observable<any>((observer) => {
      let message: string
      this.afAuth.signOut().then(() => {
        message = 'success'
        console.log("signed out")
        this.loggedInUser.next(null)
        localStorage.clear();
        observer.next(message);
      },
        (err) => {
          message = 'failed'
          console.log("Couldnt sign out")
        })
    })
  }


  async getSingleUsers(userId: any) {
    const tutorialsRef = this.afs.collection('Users');
    const edit: any = await tutorialsRef.doc(userId).get();
    const snapshot = edit.docs[0];
    const data = snapshot.data();
  }

  addnewUserToFirebase(user: any): Promise<any> {
    console.log('user in firebase', user);
    // const add = await this.afs.collection(`Users`).add(user);
    // console.log("FIRBASE ADD USER DATA",add.collection);
    return new Promise((resolve) => {
      let signup = this.afAuth.createUserWithEmailAndPassword(user.user_email, user.user_pass)
        .then((result) => {
          console.log('result in firebase', result)
          const add = this.afs.collection(`Users`).add(user);
          resolve("successful")
          this._snackBar.open('User Added', 'done', {
            duration: 3000
          });
          console.log("FIRBASE ADD USER DATA", add);
          // console.log(signup);
        })
        .catch((error) => {
          // window.alert(error.message);
          console.log('firebase errors is:::', error)
          resolve("error");
          this._snackBar.open('Please fill correct all data', 'ok', {
            duration: 3000
          });
        })
    })
  }

  addUserCollection(user: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afs.collection(`Users`).add(user).then((result) => {
        console.log('firebase result ', result)
        resolve(result);
      }).catch((error) => {
        reject('error');
      })
    })
  }

  async updateUser(user: any, documentId: any): Promise<any> {
    const tutorialsRef = this.afs.collection('Users');
    const edit = await tutorialsRef.doc(documentId).update(user)
      .then(() => {
        this._snackBar.open('User detail updated', 'ok', {
          duration: 3000
        });
      })
      .catch(() => {
        this._snackBar.open('user not updated', 'ok', {
          duration: 3000
        })
      })
    return edit
    // const edit = this.afs.doc(`Users/${user.email}`).update({ userName: user.userName }); //<-- $rating is dynamic
  }

  async removeUser(id: any) {
    const tutorialsRef = this.afs.collection('Users');
    const remove = await tutorialsRef.doc(id).delete();
    this._snackBar.open('User deleted', 'ok', {
      duration: 3000
    });
    return remove
  }

/** @note THIS IS USED FOR SIGNUP FILE MANAGES */

  success(message: string, action: string, duration: number) { /**  @note this is used to handle all sucess messages */
    this._snackBar.open(message, action, { duration });
  }

  error(message: string, action: string, duration: number) { /**  @note this is used to handle all error messages  */
    this._snackBar.open(message, action, { duration });
  }

  somethingWent(message: string, action: string, duration: number) { /**   @note this is used to handle all something error messages */
    this._snackBar.open(message, action, { duration });
  }

}
