from abc import ABC, abstractmethod


class Repository(ABC):
    """
    This is a abstract base class for CRUD method.
    """
    @abstractmethod
    def add(self, obj):
        """
        Add object to the repository.
        """
        pass

    @abstractmethod
    def get(self, obj_id):
        """
        Get object by ID.
        """
        pass

    @abstractmethod
    def get_all(self):
        """
        Get all objects in the repository.
        """
        pass

    @abstractmethod
    def update(self, obj_id, data):
        """
        Update attribute object.
        """
        pass

    @abstractmethod
    def delete(self, obj_id):
        """
        Delete object by ID.
        """
        pass

    @abstractmethod
    def get_by_attribute(self, attr_name, attr_value):
        """
        Get object by attribute value.
        """
        pass


class InMemoryRepository(Repository):
    """
    This is a memory storage for objects with ID attribute.
    """
    def __init__(self):
        self._storage = {}

    def add(self, obj):
        """
        Add object to the repository.
        """
        self._storage[obj.id] = obj

    def get(self, obj_id):
        """
        Get object from the repository by ID.
        """
        return self._storage.get(str(obj_id))

    def get_all(self):
        """
        Get all objects from the repository.
        """
        return list(self._storage.values())

    def update(self, obj_id, data):
        """
        Update object and data in the repository.
        """
        obj = self.get(obj_id)
        if obj:
            obj.update(data)
        return obj

    def delete(self, obj_id):
        """
        Delete object from the repository by Id.
        """
        if obj_id in self._storage:
            del self._storage[obj_id]

    def get_by_attribute(self, attr_name, attr_value):
        """
        Get object by attribute value.
        """
        return next((obj for obj in self._storage.values() if getattr(obj, attr_name) == attr_value), None)
