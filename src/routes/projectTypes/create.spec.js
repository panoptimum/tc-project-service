/**
 * Tests for create.js
 */
import chai from 'chai';
import request from 'supertest';

import server from '../../app';
import testUtil from '../../tests/util';
import models from '../../models';

const should = chai.should();

describe('CREATE project type', () => {
  beforeEach(() => testUtil.clearDb()
    .then(() => models.ProjectType.create({
      key: 'key1',
      displayName: 'displayName 1',
      createdBy: 1,
      updatedBy: 1,
    })).then(() => Promise.resolve()),
  );
  after(testUtil.clearDb);

  describe('POST /projectTypes', () => {
    const body = {
      param: {
        key: 'app_dev',
        displayName: 'Application Development',
      },
    };

    it('should return 403 if user is not authenticated', (done) => {
      request(server)
        .post('/v4/projectTypes')
        .send(body)
        .expect(403, done);
    });

    it('should return 403 for member', (done) => {
      request(server)
        .post('/v4/projectTypes')
        .set({
          Authorization: `Bearer ${testUtil.jwts.member}`,
        })
        .send(body)
        .expect(403, done);
    });

    it('should return 403 for copilot', (done) => {
      request(server)
        .post('/v4/projectTypes')
        .set({
          Authorization: `Bearer ${testUtil.jwts.copilot}`,
        })
        .send(body)
        .expect(403, done);
    });

    it('should return 403 for manager', (done) => {
      request(server)
        .post('/v4/projectTypes')
        .set({
          Authorization: `Bearer ${testUtil.jwts.manager}`,
        })
        .send(body)
        .expect(403, done);
    });

    it('should return 422 for missing key', (done) => {
      const invalidBody = {
        param: {
          displayName: 'displayName',
        },
      };

      request(server)
        .post('/v4/projectTypes')
        .set({
          Authorization: `Bearer ${testUtil.jwts.admin}`,
        })
        .send(invalidBody)
        .expect('Content-Type', /json/)
        .expect(422, done);
    });

    it('should return 422 for missing displayName', (done) => {
      const invalidBody = {
        param: {
          key: 'key',
        },
      };

      request(server)
        .post('/v4/projectTypes')
        .set({
          Authorization: `Bearer ${testUtil.jwts.admin}`,
        })
        .send(invalidBody)
        .expect('Content-Type', /json/)
        .expect(422, done);
    });

    it('should return 422 for duplicated key', (done) => {
      const invalidBody = {
        param: {
          key: 'key1',
          displayName: 'displayName',
        },
      };

      request(server)
        .post('/v4/projectTypes')
        .set({
          Authorization: `Bearer ${testUtil.jwts.admin}`,
        })
        .send(invalidBody)
        .expect('Content-Type', /json/)
        .expect(422, done);
    });

    it('should return 201 for admin', (done) => {
      request(server)
        .post('/v4/projectTypes')
        .set({
          Authorization: `Bearer ${testUtil.jwts.admin}`,
        })
        .send(body)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          const resJson = res.body.result.content;
          resJson.key.should.be.eql(body.param.key);
          resJson.displayName.should.be.eql(body.param.displayName);

          resJson.createdBy.should.be.eql(40051333); // admin
          should.exist(resJson.createdAt);
          resJson.updatedBy.should.be.eql(40051333); // admin
          should.exist(resJson.updatedAt);
          should.not.exist(resJson.deletedBy);
          should.not.exist(resJson.deletedAt);

          done();
        });
    });

    it('should return 201 for connect admin', (done) => {
      request(server)
        .post('/v4/projectTypes')
        .set({
          Authorization: `Bearer ${testUtil.jwts.connectAdmin}`,
        })
        .send(body)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          const resJson = res.body.result.content;
          resJson.createdBy.should.be.eql(40051336); // connect admin
          resJson.updatedBy.should.be.eql(40051336); // connect admin
          done();
        });
    });
  });
});