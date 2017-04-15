/* Copyright (c) 2015, 2016, Oracle and/or its affiliates. All rights reserved. */

/******************************************************************************
 *
 * You may not use the identified files except in compliance with the Apache
 * License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * NAME
 *   parseAndSend.js
 *
 * DESCRIPTION
 *   Takes a Json file and extracts the necessary information, then connectString
 *		to an oracle database table (specified in dbconfig.js) and inserts the 
 *		parsed information.
 *
 * DEPENDENCIES (node_modules must be located in the same directory as this file)
 *	oracledb - node.js/Oracle interaction (needs Python 2.7, C++11 compiler,
		Oracle InstantClient 12)
 *	async - Handles multiple processes running at once
 *
 *
 *****************************************************************************/

function parseJson (inJson) {
    var alertId = inJson['data']['id'];
    var name = inJson['data']['alertDefinition']['name'];
    var description = inJson['data']['alertDefinition']['description'];
    var location = inJson['data']['alertDefinition']['locationId'];
    var creator = inJson['data']['alertDefinition']['lastUpdatedByUserString'];
    var timeStamp = inJson['data']['initiateTimestamp'];
    var comments = inJson['data']['alertComments']['comments'];
	
    //FINAL: table fields in order: siteID, assetID, WO_Type, AlertID, comments
	//Todo: change this function to retrieve the fields above
    return [alertId, name, description, location];

}

var alert = {
    "status": "Success",
    "message": "Successfully resolved the alert.",
    "data": {
        "id": 22185,
        "alertDefinition": {
            "id": 7579,
            "alertType": {
                "id": 52,
                "name": "Defect",
                "description": "Defect",
                "locationId": null,
                "archived": false,
                "lastUpdatedDate": 1481470599773,
                "lastUpdatedByUserString": "Andrew Severson",
                "userSubscribed": false
            },
            "alertDefinitionSlas": [
                {
                    "id": 10906,
                    "order": 1,
                    "numberOfMinutes": 30
                },
                {
                    "id": 10907,
                    "order": 2,
                    "numberOfMinutes": 60
                },
                {
                    "id": 10908,
                    "order": 3,
                    "numberOfMinutes": 120
                },
                {
                    "id": 10909,
                    "order": 4,
                    "numberOfMinutes": 240
                }
            ],
            "locationId": "008bffa2-549e-4eb1-b5d8-de53fc0b3f00",
            "name": "TEST",
            "description": "DESCRIPTION",
            "qrCode": "2b739096-6e77-4189-89ad-deb3a8b7a476",
            "onlyOneActive": null,
            "archived": false,
            "lastUpdatedByUserString": "Kimberley Parnell",
            "lastUpdatedDate": 1489781020159,
            "hasSlaCoverage": false,
            "hasStatusCoverage": false
        },
        "slaCheckTimestamp": 1490020053452,
        "initiateTimestamp": 1490020053452,
        "acknowledgeTimestamp": 1490020650040,
        "resolveTimestamp": 1490021102683,
        "alertSlaCount": 0,
        "status": "Resolved",
        "slaPause": false,
        "slaPauseDatetime": null,
        "alertComments": [
            {
                "id": 32111,
                "alertComment": "string",
                "alertCommentDate": 1490020053462,
                "alertCommentType": "Initiated",
                "userString": "Kimberley Parnell",
                "sso": "212572107"
            },
            {
                "id": 32112,
                "alertComment": "string",
                "alertCommentDate": 1490020233252,
                "alertCommentType": "Acknowledged",
                "userString": "Kimberley Parnell",
                "sso": "212572107"
            },
            {
                "id": 32113,
                "alertComment": "string",
                "alertCommentDate": 1490020560390,
                "alertCommentType": "Unacknowledged",
                "userString": "Kimberley Parnell",
                "sso": "212572107"
            },
            {
                "id": 32114,
                "alertComment": "string",
                "alertCommentDate": 1490020650047,
                "alertCommentType": "Resolved",
                "userString": "Kimberley Parnell",
                "sso": "212572107"
            },
            {
                "id": 32115,
                "alertComment": "Failure ID: FCO_CSW_YI_0028_A0, Failure Description: FLT_761 MAIN CARRIAGE AMPLIFIER FAULT, Asset Number:M0003714, Asset Activity: NULL, WO Type: Emergency, Maintainence Group: FCO_MAINT ",
                "alertCommentDate": 1490021063624,
                "alertCommentType": "Resolved",
                "userString": "Kimberley Parnell",
                "sso": "212572107"
            },
            {
                "id": 32116,
                "alertComment": "string",
                "alertCommentDate": 1490021102686,
                "alertCommentType": "Resolved",
                "userString": "Kimberley Parnell",
                "sso": "212572107"
            }
        ],
        "initiatedByUserString": "Kimberley Parnell",
        "acknowledgedByUserString": "Kimberley Parnell",
        "resolvedByUserString": "Kimberley Parnell"
    }
}


//Call function with test Json above
var statements = parseJson(alert)


//Database scripting starts here
var async = require('async');
var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js');

var doconnect = function(cb) {
  oracledb.getConnection(
    {
      user          : dbConfig.user,
      password      : dbConfig.password,
      connectString : dbConfig.connectString
    },
    cb);
};

// Close the connection to the database when everything is finished.
// This should always be done if nothing else is being processed!
var dorelease = function(conn) {
  conn.close(function (err) {
    if (err)
      console.error(err.message);
  });
};

//Insert the necessary information into the staging area.
//TODO: change this function whenever the parse function is changed.
var doinsert = function (conn, cb) {
  conn.execute(
    "INSERT INTO staging VALUES (:alert_id, :alert_name, :description, :location)",
    [statements[0], statements[1], statements[2], statements[3]],  // Bind values
	{ autoCommit: true},  // Override the default non-autocommit behavior
    function(err, result)
    {
      if (err) {
        return cb(err, conn);
      } else {
        console.log("Rows inserted: " + result.rowsAffected);  // 1
        return cb(null, conn);
      }
    });
};

async.waterfall(
  [
    doconnect,
    doinsert
  ],
  function (err, conn) {
    if (err) { console.error("In waterfall error cb: ==>", err, "<=="); }
    if (conn)
	{
		dorelease(conn);
	}
  });