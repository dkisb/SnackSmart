'use client';

import { useState } from 'react';
import type { CreateMessage } from '@ai-sdk/react';
import { set } from 'zod/v4';

export default function UserForm({
  append,
  onSubmitSuccess,
}: {
  append: (msg: CreateMessage) => void;
  onSubmitSuccess: () => void;
}) {
  const [type, setType] = useState<'bulk' | 'cut' | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [height, setHeight] = useState('');
  const [targetCalories, setTargetCalories] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let optionalDetails = '';

    if (targetCalories) {
      optionalDetails += `- Target daily calories: ${targetCalories} kcal\n`;
    }

    if (mealsPerDay) {
      optionalDetails += `- Number of meals per day: ${mealsPerDay}\n`;
    }

    const userMessage = `
Bevitt felhasználói adatok:
- Diet Type: ${type}
- Gender: ${gender}
- Age: ${age}
- Target Weight: ${targetWeight ? targetWeight + ' kg' : 'N/A'}
- Activity Level: ${activityLevel ? activityLevel : 'N/A'} times a week
- Weight: ${weight} kg
- Height: ${height} cm
${optionalDetails ? optionalDetails : ''}

Please generate a personalized meal plan with accurate nutrient breakdowns and supplement recommendations.
`;

    append({
      role: 'user',
      content: userMessage,
    });

    setGender('');
    setType('');
    setAge('');
    setWeight('');
    setActivityLevel('');
    setTargetWeight('');
    setHeight('');
    setTargetCalories('');
    setMealsPerDay('');

    onSubmitSuccess();
  };

  return (
    <div className="bg-[#222222] p-6 rounded-lg shadow-lg border border-[#333333]">
      <h2 className="text-2xl font-bold mb-4 text-[#FFD700]">Nutrition Chat Assistant</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Gender Radio Buttons */}
        <div>
          <label className="block text-[#F5F5F5] mb-2">Gender</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === 'male'}
                onChange={() => setGender('male')}
                className="accent-[#FFD700]"
                required
              />
              <span>Male</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === 'female'}
                onChange={() => setGender('female')}
                className="accent-[#FFD700]"
                required
              />
              <span>Female</span>
            </label>
          </div>
          <label className="block text-[#F5F5F5] mb-2">Diet type</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="diet"
                value="cut"
                checked={type === 'cut'}
                onChange={() => setType('cut')}
                className="accent-[#FFD700]"
                required
              />
              <span>Cut</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="diet"
                value="bulk"
                checked={type === 'bulk'}
                onChange={() => setType('bulk')}
                className="accent-[#FFD700]"
                required
              />
              <span>Bulk</span>
            </label>
          </div>
        </div>

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="bg-[#333333] text-[#F5F5F5] border border-[#444444] p-3 w-full rounded focus:outline-none focus:border-[#FFD700]"
          required
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="bg-[#333333] text-[#F5F5F5] border border-[#444444] p-3 w-full rounded focus:outline-none focus:border-[#FFD700]"
          required
        />
        <input
          type="number"
          placeholder="Target Weight (kg)"
          value={targetWeight}
          onChange={(e) => setTargetWeight(e.target.value)}
          className="bg-[#333333] text-[#F5F5F5] border border-[#444444] p-3 w-full rounded focus:outline-none focus:border-[#FFD700]"
          required
        />
        <input
          type="number"
          placeholder="How many times do you exercise per week?"
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value)}
          className="bg-[#333333] text-[#F5F5F5] border border-[#444444] p-3 w-full rounded focus:outline-none focus:border-[#FFD700]"
          required
        />
        <input
          type="number"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="bg-[#333333] text-[#F5F5F5] border border-[#444444] p-3 w-full rounded focus:outline-none focus:border-[#FFD700]"
          required
        />
        <input
          type="number"
          placeholder="Target daily calories (optional)"
          value={targetCalories}
          onChange={(e) => setTargetCalories(e.target.value)}
          className="bg-[#333333] text-[#F5F5F5] border border-[#444444] p-3 w-full rounded focus:outline-none focus:border-[#FFD700]"
        />
        <input
          type="number"
          placeholder="Meals per day (optional)"
          value={mealsPerDay}
          onChange={(e) => setMealsPerDay(e.target.value)}
          className="bg-[#333333] text-[#F5F5F5] border border-[#444444] p-3 w-full rounded focus:outline-none focus:border-[#FFD700]"
        />

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
