const { test, expect } = require('@playwright/test');
const Ajv = require("ajv");

const getSchema = require('./jsonSchema/get-schema.json');
const postSchema = require('./jsonSchema/post-schema.json');
const deleteSchema = require('./jsonSchema/delete-schema.json');
const putSchema = require('./jsonSchema/put-schema.json');

const ajv = new Ajv({
    strict: false,
    $data: true,
    loadSchema: async (url) => {
        // Ignore external references by returning null
        return null;
    },  
    validateSchema: false // Disable automatic schema validation for references
});

test.describe("API Test", () => {
    test('Get', async ({ request }) => {
        const responseGet = await request.get("https://reqres.in/api/users?page=2");
        expect(responseGet.status()).toBe(200);

        const responseDataGet = await responseGet.json();

        // Assertions for specific fields
        expect(responseDataGet.page).toBe(2);
        expect(responseDataGet.per_page).toBe(6);

        console.log("Response Data Get:", JSON.stringify(responseDataGet, null, 2));

        const valid = ajv.validate(getSchema, responseDataGet);
        if (!valid) {
            console.error("Ajv Validation error:", ajv.errorsText());
        }
        expect(valid).toBe(true);
    });

    test('Post', async ({ request }) => {
        const bodyData = {
            "name": "Haekal",
            "job": "Ojol"
        };

        const headerData = {
            Accept: "application/json"
        };

        const responsePost = await request.post("https://reqres.in/api/users", {
            headers: headerData,
            data: bodyData
        });

        expect(responsePost.status()).toBe(201);

        const responseDataPost = await responsePost.json();
        console.log("Response Data Post:", JSON.stringify(responseDataPost, null, 2));

        expect(responseDataPost.name).toBe("Haekal");
        expect(responseDataPost.job).toBe("Ojol");

        const valid = ajv.validate(postSchema, responseDataPost);
        if (!valid) {
            console.error("Ajv Validation error:", ajv.errorsText());
        }
        expect(valid).toBe(true);
    });

    test('Delete', async ({ request }) => {
        const responseDelete = await request.delete("https://reqres.in/api/users/2");

        expect(responseDelete.status()).toBe(204);

        // No content on DELETE response, avoid parsing JSON
        if (responseDelete.status() !== 204) {
            const responseDataDelete = await responseDelete.json();
            console.log("Response Data Delete:", JSON.stringify(responseDataDelete, null, 2));

            const valid = ajv.validate(deleteSchema, responseDataDelete);
            if (!valid) {
                console.error("Ajv Validation error:", ajv.errorsText());
            }
            expect(valid).toBe(true);
        } else {
            console.log("No content returned for DELETE request.");
        }
    });

    test('Put', async ({ request }) => {
        const bodyData = {
            "name": "Haekal",
            "job": "Karyawan"
        };
    
        const headerData = {
            Accept: "application/json"
        };
    
        const responsePut = await request.put("https://reqres.in/api/users/2", {
            headers: headerData,
            data: bodyData
        });
    
        expect(responsePut.status()).toBe(200);
    
        const responseDataPut = await responsePut.json();
        console.log("Response Data Put:", JSON.stringify(responseDataPut, null, 2));
    
        // Validate with schema
        const valid = ajv.validate(putSchema, responseDataPut);
        if (!valid) {
            console.error("Ajv Validation error:", ajv.errorsText());
        }
    
        expect(valid).toBe(true);
    });
});