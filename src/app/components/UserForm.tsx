'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import type { CreateMessage } from '@ai-sdk/react';
import { useAuth } from '../providers/AuthProvider';

type UserFormProps = {
  onChatCreated: (chatId: Id<'chats'>, firstMessage: CreateMessage) => void;
};

export default function UserForm({ onChatCreated }: UserFormProps) {
  const { token } = useAuth(); // JWT token from AuthProvider
  const createChat = useMutation(api.chats.createChat);

  const [type, setType] = useState<'bulk' | 'cut' | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [height, setHeight] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState('');

  const inputFields = [
    { key: 'age', placeholder: 'Age', value: age, setter: setAge, required: true },
    { key: 'weight', placeholder: 'Weight (kg)', value: weight, setter: setWeight, required: true },
    {
      key: 'targetWeight',
      placeholder: 'Target Weight (kg)',
      value: targetWeight,
      setter: setTargetWeight,
      required: true,
    },
    {
      key: 'activityLevel',
      placeholder: 'How many times do you exercise per week?',
      value: activityLevel,
      setter: setActivityLevel,
      required: true,
    },
    { key: 'height', placeholder: 'Height (cm)', value: height, setter: setHeight, required: true },
    {
      key: 'targetCalories',
      placeholder: 'Target daily calories (optional)',
      value: targetCalories,
      setter: setTargetCalories,
      required: false,
    },
    {
      key: 'mealsPerDay',
      placeholder: 'Meals per day (optional)',
      value: mealsPerDay,
      setter: setMealsPerDay,
      required: false,
    },
  ] as const;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      alert('You must be logged in to create a chat.');
      return;
    }

    const userMessage = `
Szia! ${age} éves ${gender === 'male' ? 'férfi' : 'nő'} vagyok, jelenleg ${weight} kg a testsúlyom és ${height} cm magas vagyok.
Átlagosan hetente ${activityLevel} alkalommal szoktam edzeni.
A célom, hogy ${type === 'bulk' ? 'tömeget növeljek' : 'fogyjak'} és elérjem a ${targetWeight ? targetWeight + ' kg-os' : 'kitűzött'} testsúlyt.
${targetCalories ? `Nagyjából ${targetCalories} kcal körüli napi bevitelt szeretnék tartani.` : ''}
${mealsPerDay ? `Általában napi ${mealsPerDay} étkezést preferálok.` : ''}

Kérlek, készíts egy személyre szabott étrendet pontos tápanyag bontással és étrend-kiegészítő javaslatokkal.
`.trim();

    // Create chat in Convex (server extracts userId from token)
    const newChatId = (await createChat({
      token,
      title: `Meal Plan for ${gender}, ${age}y, ${weight}kg`,
    })) as Id<'chats'>;

    onChatCreated(newChatId, { role: 'user', content: userMessage });

    // Reset form
    setGender('');
    setType('');
    setAge('');
    setWeight('');
    setActivityLevel('');
    setTargetWeight('');
    setHeight('');
    setTargetCalories('');
    setMealsPerDay('');
  };

  return (
    <div className="bg-[#222222] p-6 rounded-lg shadow-lg border border-[#333333]">
      <h2 className="text-2xl font-bold mb-4 text-[#FFD700]">Nutrition Chat Assistant</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Gender Radio Buttons */}
        <div>
          <label className="block text-[#F5F5F5] mb-2">Gender</label>
          <div className="flex space-x-4">
            {(['male', 'female'] as const).map((g) => (
              <label key={g} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                  className="accent-[#FFD700]"
                  required
                />
                <span>{g[0].toUpperCase() + g.slice(1)}</span>
              </label>
            ))}
          </div>

          <label className="block text-[#F5F5F5] mb-2 mt-4">Diet type</label>
          <div className="flex space-x-4">
            {(['cut', 'bulk'] as const).map((d) => (
              <label key={d} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="diet"
                  value={d}
                  checked={type === d}
                  onChange={() => setType(d)}
                  className="accent-[#FFD700]"
                  required
                />
                <span>{d[0].toUpperCase() + d.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Mapped Inputs */}
        {inputFields.map((field) => (
          <input
            key={field.key}
            type="number"
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => field.setter(e.target.value)}
            className="bg-[#333333] text-[#F5F5F5] border border-[#444444] p-3 w-full rounded focus:outline-none focus:border-[#FFD700]"
            required={field.required}
          />
        ))}

        <button
          type="submit"
          className="bg-[#FFD700] hover:bg-yellow-400 text-black font-bold px-4 py-3 rounded w-full transition-colors duration-300"
        >
          Generate Meal Plan
        </button>
      </form>
    </div>
  );
}
