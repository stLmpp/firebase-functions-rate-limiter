import { expect, use as chaiUse } from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as _ from "lodash";
import "mocha";
import { randomUUID } from "node:crypto";
import * as sinon from "sinon";

chaiUse(chaiAsPromised);

export { _, expect, sinon, randomUUID as uuid };
