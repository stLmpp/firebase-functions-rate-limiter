import * as firebaseTypes from "firebase/app";

import { FirestoreEquivalent } from "./FirestoreEquivalent.js";
import { RealtimeDbEquivalent } from "./RealtimeDbEquivalent.js";

describe("Firebase equivalents", () => {
    // tslint:disable prefer-const
    let firestore!: firebaseTypes.firestore.Firestore;
    let database!: firebaseTypes.database.Database;

    describe("FirestoreEquivalent", () => {
        function acceptFirestoreEquivalent(firestoreEquivalent: FirestoreEquivalent) {
            return firestoreEquivalent;
        }

        it("Matches firebase/app typings", () => {
            acceptFirestoreEquivalent(firestore);
        });
    });

    describe("RealtimeDbEquivalent", () => {
        function acceptRealtimeDbEquivalent(realtimeDbEquivalent: RealtimeDbEquivalent) {
            return realtimeDbEquivalent;
        }

        it("Matches firebase/app typings", () => {
            acceptRealtimeDbEquivalent(database);
        });
    });
});
