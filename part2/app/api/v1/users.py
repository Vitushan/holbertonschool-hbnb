#!/usr/bin/python3
"""
This is a module for interpreting python3
"""

from flask_restx import Namespace, Resource, fields
from app.services import facade
from app.models.user import User

api = Namespace('users', description='User operations')

user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True),
})

user_put_model = api.model('UserPut', {
    'email': fields.String(required=False),
    'first_name': fields.String(required=False),
    'last_name': fields.String(required=False),
    'password': fields.String(required=False),
})

@api.route('/')
class UserList(Resource):
    """
    Handles listing and creation of users.
    """
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(409, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def post(self):
        """
        Register a new user
        """
        user_data = api.payload

        existing_user = facade.get_user_by_email(user_data['email'])
        if existing_user:
            return {'error': 'Email already registered'}, 409
        
        if not User.verified_email(user_data['email']):
            return {'error': 'Invalid input data'}, 400

        new_user = facade.create_user(user_data)
        return {
            'id': new_user.id,
            'first_name': new_user.first_name,
            'last_name': new_user.last_name,
            'email': new_user.email,
            'created_at': new_user.created_at.isoformat()
        }, 201

    @api.response(200, 'List of users successfully retrieved')
    def get(self):
        users = facade.get_all_users()
        return users, 200

@api.route('/<user_id>')
class UserResource(Resource):
    """
    Handles retrieval, update, and deletion of a specific user.
    """
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """
        Get user details by ID
        """
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }, 200

    @api.expect(user_put_model, validate=True)
    @api.response(200, 'User successfully updated')
    @api.response(404, 'User not found')
    @api.response(409, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def put(self, user_id):
        data = api.payload
        user = facade.get_user(user_id)
        if user is None:
            return {"error": "User not found"}, 404

        if 'email' in data:
            existing_user = facade.get_user_by_email(data['email'])
            if existing_user and existing_user.id != user.id:
                return {"error": "Email already registered"}, 409

            if not User.verified_email(data['email']):
                return {'error': 'Invalid input data'}, 400

        updated_user = facade.update(user_id, data)
        if updated_user is None:
            return {'error': 'Update failed'}, 400
        
        return updated_user.to_dict(), 200
