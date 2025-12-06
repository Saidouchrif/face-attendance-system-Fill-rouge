import React, { useState } from "react";
import { createEmployee } from "../services/employeesService";
import { useNavigate } from "react-router-dom";

export default function AddEmployee() {
  const navigate = useNavigate();
  const [savedEmployee, setSavedEmployee] = useState(null);

  const [form, setForm] = useState({
    matricule: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    poste: "",
    departement: "",
    date_embauche: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const emp = await createEmployee(form);
      setSavedEmployee(emp);
    } catch (err) {
      alert(err.message);
    }
  }

  function goToTraining() {
    navigate(`/train-face/${savedEmployee.id}`);
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Ajouter un employé
      </h1>

      <p className="text-slate-600 mb-8">
        Remplissez les informations de l’employé.
      </p>

      {/* FORM */}
      {!savedEmployee && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6 border border-slate-200"
        >

          {/* Matricule */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Matricule
            </label>
            <input
              name="matricule"
              onChange={handleChange}
              placeholder="EX: EMP001"
              className="w-full px-4 py-2 rounded-lg border border-slate-300"
            />
          </div>

          {/* Nom */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom
            </label>
            <input
              name="last_name"
              onChange={handleChange}
              placeholder="Dupont"
              className="w-full px-4 py-2 rounded-lg border border-slate-300"
            />
          </div>

          {/* Prénom */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prénom
            </label>
            <input
              name="first_name"
              onChange={handleChange}
              placeholder="Jean"
              className="w-full px-4 py-2 rounded-lg border border-slate-300"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Enregistrer l'employé
          </button>
        </form>
      )}

      {/* SUCCESS BLOCK */}
      {savedEmployee && (
        <div className="mt-6 bg-white shadow-lg border border-slate-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-green-700">✔ Employé enregistré</h2>

          <p className="text-slate-700 mt-2">
            {savedEmployee.first_name} {savedEmployee.last_name} a été ajouté.
          </p>

          <button
            onClick={goToTraining}
            className="w-full mt-4 bg-orange-600 hover:bg-orange-700 
                       text-white px-6 py-3 rounded-lg font-semibold shadow transition"
          >
            ▶ Lancer l'entraînement du modèle
          </button>
        </div>
      )}
    </div>
  );
}
