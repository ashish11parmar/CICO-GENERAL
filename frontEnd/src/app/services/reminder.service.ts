import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from '../config';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * @returns reminder configure list from Sheet.
   */
  getReminderConfig() {
    let query = 'select *';
    let sheet = config.reminderConfigSheetId;
    let subSheet = 'remidnerConfig';
    return this.http.get(
      `${config.getJSONResponse}?sheet=${sheet}&subsheet=${subSheet}&query=${query}`
    );
  }

  /**
   * @param reminderObj to be add/update
   * @param isUpdate true -> for updating reminder, else add new reminder.
   */
  updateReminder(reminderObj: any, isUpdate: boolean) {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain;');
    let reminderPayload = {
      sheet: config.reminderConfigSheetId,
      subsheet: 'remidnerConfig',
      data: isUpdate ? [reminderObj] : reminderObj,
    };
    return this.http.post(`${isUpdate ? config.updateReminderUrl : config.addReminderUrl}`, reminderPayload, {
      headers,
      responseType: 'text',
    });
  }
}
