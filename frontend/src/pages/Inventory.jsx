import { useEffect, useState } from "react";
import axios from "axios";

function Inventory() {

  const [items, setItems] = useState([]);

  const [itemName, setItemName] = useState("");

  // ==================================
  // FETCH INVENTORY
  // ==================================

  const fetchInventory = async () => {

    try {

      const res = await axios.get(
        "http://127.0.0.1:8000/inventory"
      );

      setItems(res.data);

    } catch (error) {

      console.error(error);

    }

  };

  useEffect(() => {

    fetchInventory();

  }, []);

  // ==================================
  // ADD ITEM
  // ==================================

  const addItem = async () => {

    if (!itemName.trim()) return;

    try {

      await axios.post(
        "http://127.0.0.1:8000/inventory",
        {
          name: itemName
        }
      );

      setItemName("");

      fetchInventory();

    } catch (error) {

      console.error(error);

    }

  };

  // ==================================
  // DELETE ITEM
  // ==================================

  const deleteItem = async (name) => {

    try {

      await axios.delete(
        `http://127.0.0.1:8000/inventory/${name}`
      );

      fetchInventory();

    } catch (error) {

      console.error(error);

    }

  };

  return (
    <div>

      <h1 className="page-title">
        Inventory
      </h1>

      <div className="form">

        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) =>
            setItemName(e.target.value)
          }
        />

        <button onClick={addItem}>
          Add Item
        </button>

      </div>

      <div className="inventory-grid">

        {items.map((item, index) => (

          <div
            className="inventory-card"
            key={index}
          >

            <h3>{item.name}</h3>

            <button
              className="delete-btn"
              onClick={() =>
                deleteItem(item.name)
              }
            >
              Remove
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Inventory;