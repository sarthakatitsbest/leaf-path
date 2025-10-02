interface WeeklySummary {
  total_co2: number;
  transport_kg: number;
  food_kg: number;
  waste_kg: number;
  energy_kg: number;
  avg_per_day: number;
}

export function getTips(weeklySummary: WeeklySummary): string[] {
  const tips: string[] = [];

  if (weeklySummary.transport_kg > weeklySummary.total_co2 * 0.4) {
    tips.push("Your transport contributes significantly to your footprint. Try carpooling, using public transport, or replacing short car trips with cycling.");
  }

  if (weeklySummary.waste_kg > 3) {
    tips.push("Waste generation is high — consider composting organic waste and reducing single-use plastics.");
  }

  if (weeklySummary.food_kg > 10) {
    tips.push("Food emissions are high. Try 1-2 meat-free days per week or choose lower-impact proteins like chicken or fish.");
  }

  if (weeklySummary.energy_kg > 15) {
    tips.push("Electricity use is significant — turn off standby devices, switch to LED bulbs, and consider solar panels.");
  }

  if (weeklySummary.avg_per_day < 5) {
    tips.push("Great work! You're below the average daily footprint. Keep it up by maintaining these habits.");
  }

  if (tips.length === 0) {
    tips.push("Nice work! Keep tracking and try small improvements like shorter showers or mindful grocery choices.");
  }

  return tips;
}
