from app.persistence.repository import InMemoryRepository
from app.models.user import User
from app.models.amenity import Amenity
from app.models.place import Place
from app.models.review import Review


class HBnBFacade:
    """
    Central facade for managing users, places,
    amenities and reviews.
    """
    def __init__(self):
        """
        Initialize the facade with in-memory repositories for all models.
        """
        self.user_repo = InMemoryRepository()
        self.place_repo = InMemoryRepository()
        self.review_repo = InMemoryRepository()
        self.amenity_repo = InMemoryRepository()

    # User
    def create_user(self, user_data):
        """
        Create a new user.
        """
        user = User(**user_data)
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        """
        Get a user by ID.
        """
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        """
        Get a user by email address.
        """
        return self.user_repo.get_by_attribute('email', email)

    def get_user_by_id(self, id):
        """
        Get a user by ID.
        """
        return self.user_repo.get_by_attribute('id', id)

    def get_all_users(self):
        """
        Get a list of all users.
        """
        users = self.user_repo.get_all()
        return [user.to_dict() for user in users]

    def update(self, user_id, data):
        """
        Update a user information.
        """
        self.user_repo.update(user_id, data)
        return self.user_repo.get(user_id)

    # Amenity
    def create_amenity(self, amenity_data):
        """
        Create a new Amenity.
        """
        amenity = Amenity(**amenity_data)
        self.amenity_repo.add(amenity)
        return amenity

    def get_amenity(self, amenity_id):
        """
        Get amenity by ID.
        """
        return self.amenity_repo.get(amenity_id)

    def get_all_amenities(self):
        """
        Get a list of all amenities.
        """
        amenities = self.amenity_repo.get_all()
        return [amenity.to_dict() for amenity in amenities]

    def get_amenity_by_id(self, id):
        """
        Get amenity by ID.
        """
        return self.amenity_repo.get_by_attribute('id', id)

    def update_amenity(self, amenity_id, amenity_data):
        """
        Update amenity information.
        """
        self.amenity_repo.update(amenity_id, amenity_data)
        return self.amenity_repo.get(amenity_id)

    # Place
    def create_place(self, place_data):
        """
        Create a new place.
        """
        place = Place(**place_data)
        self.place_repo.add(place)
        return place

    def get_place(self, place_id):
        """
        Get place by ID.
        """
        return self.place_repo.get(place_id)

    def get_all_places(self):
        """
        Get a list of all places.
        """
        places = self.place_repo.get_all()
        return [place.to_dict() for place in places]

    def update_place(self, place_id, place_data):
        """
        Update a place information.
        """
        self.place_repo.update(place_id, place_data)
        return self.place_repo.get(place_id)

    # Review
    def create_review(self, review_data):
        """
        Create a new review.
        """
        review = Review(**review_data)
        self.review_repo.add(review)
        return review

    def get_review(self, review_id):
        """
        Get a review by ID.
        """
        return self.review_repo.get(review_id)

    def get_all_reviews(self):
        """
        Get a list of all reviews.
        """
        reviews = self.review_repo.get_all()
        return [review.to_dict() for review in reviews]

    def get_reviews_by_place(self, place_id):
        """
        Get all reviews for a specific place.
        """
        place = self.place_repo.get(place_id)
        if place:
            return place.reviews

    def update_review(self, review_id, review_data):
        """
        Update a reviews information.
        """
        self.review_repo.update(review_id, review_data)
        return self.review_repo.get(review_id)

    def delete_review(self, review_id):
        """
        Delete a review by its ID.
        """
        return self.review_repo.delete(review_id)


facade = HBnBFacade()
