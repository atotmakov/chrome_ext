const app = require("./azuretestapi");

const { get_wi_icon, get_wi } = require('./workitem');

var XMLHttpRequest = require('xhr2');

describe('workttems suite', () => {

    let server = null;
    beforeAll(() => {
        server = app.listen(3333);
        return server;
    });

    afterAll(() => {
        return server.close();
    });

    test('get_wi_icon url', done => {
        function callback(wi_id, wi_fields, wi_links, html_link, wi_type, icon_url) {
            try {
                expect(icon_url).toBe('get_wi_icon_url');
                done();
            } catch (error) {
                done(error);
            }
        }
        get_wi_icon('http://localhost:3333/get_wi_icon', 0, 0, 0, 0, 0, callback, new XMLHttpRequest);
    });

    test('get_wi', done => {
        function callback(wi_id, wi_fields, wi_links, html_link, wi_type, icon_url) {
            try {
                let result = { fields: { 'System.WorkItemType': 'witype' }, relations: {}, _links: { 'workItemType': { href: 'http://localhost:3333/get_wi_icon' }, 'html': { href: 'htmllink' } } };

                expect(wi_id).toBe(1);
                expect(wi_fields).toEqual(result['fields']);
                expect(wi_links).toEqual(result['relations']);
                expect(wi_type).toBe('witype');
                expect(icon_url).toBe('get_wi_icon_url');
                done();
            } catch (error) {
                done(error);
            }
        }

        get_wi('http://localhost:3333/get_wi', 1, callback, new XMLHttpRequest());
    });

});