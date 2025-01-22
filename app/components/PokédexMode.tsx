'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Volume2 } from 'lucide-react'
import { Pokemon } from '@/types/pokemon'


// Helper functions (add these after the generateFunFact function)
const getNameOrigin = (name: string): string => {
  const origins = {
    'Bulbasaur': 'bulb and dinosaur',
    'Charmander': 'char (to burn) and salamander',
    'Squirtle': 'squirt and turtle',
    // Add more Pokémon name origins as needed
  };
  return origins[name as keyof typeof origins] || 'a combination of words related to its appearance or abilities';
};

const getRandomEpisode = (): number => {
  return Math.floor(Math.random() * 1000) + 1; // Assuming there are about 1000 episodes
};

const getRelatedPokemon = (name: string): string => {
  const relations = {
    'Bulbasaur': 'Ivysaur and Venusaur',
    'Charmander': 'Charmeleon and Charizard',
    'Squirtle': 'Wartortle and Blastoise',
    // Add more related Pokémon as needed
  };
  return relations[name as keyof typeof relations] || 'other Pokémon in its evolutionary line';
};

const getInspiration = (name: string): string => {
  const inspirations = {
    'Pikachu': 'the pika, a small mammal native to central and east Asia',
    'Meowth': 'the Japanese Maneki-neko, or beckoning cat',
    'Snorlax': 'hibernating bears or the Japanese myth of the Kabigon',
    // Add more inspirations as needed
  };
  return inspirations[name as keyof typeof inspirations] || 'various real-world animals or mythological creatures';
};

const calculateHP = (baseHP: number, level: number): number => {
  // This is a simplified version of the actual Pokémon HP formula
  return Math.floor(((2 * baseHP + 31 + 5) * level) / 100 + level + 10);
};

interface PokédexModeProps {
 pokemonList: Pokemon[]
}

const TYPE_COLORS = {
 normal: 'bg-gray-400',
 fire: 'bg-red-500',
 water: 'bg-blue-500',
 electric: 'bg-yellow-400',
 grass: 'bg-green-500',
 ice: 'bg-blue-200',
 fighting: 'bg-red-700',
 poison: 'bg-purple-500',
 ground: 'bg-yellow-600',
 flying: 'bg-indigo-400',
 psychic: 'bg-pink-500',
 bug: 'bg-green-600',
 rock: 'bg-yellow-700',
 ghost: 'bg-purple-700',
 dragon: 'bg-indigo-600',
 dark: 'bg-gray-700',
 steel: 'bg-gray-500',
 fairy: 'bg-pink-300',
};

const FunFact = ({ pokemon, generateFunFact }: { pokemon: Pokemon, generateFunFact: (pokemon: Pokemon) => Promise<string> }) => {
  const [fact, setFact] = useState<string>('Loading fun fact...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    generateFunFact(pokemon).then((newFact) => {
      setFact(newFact);
      setIsLoading(false);
    });
  }, [pokemon, generateFunFact]);

  return (
    <p className="text-sm italic text-[#00FFFF]/80">
      {isLoading ? 'Loading fun fact...' : fact}
    </p>
  );
};

export default function PokédexMode({ pokemonList }: PokédexModeProps) {
 const [filter, setFilter] = useState('')
 const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null)
 const scrollContainerRef = useRef<HTMLDivElement>(null)
 const [selectedRegion, setSelectedRegion] = useState<string>('all')

 const generateFunFact = useCallback(async (pokemon: Pokemon): Promise<string> => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`);
    const data = await response.json();
    
    const englishFlavorTexts = data.flavor_text_entries.filter((entry: any) => entry.language.name === 'en');
    const randomFlavorText = englishFlavorTexts[Math.floor(Math.random() * englishFlavorTexts.length)].flavor_text;
    
    const facts = [
      randomFlavorText.replace(/\n/g, ' '),
      `${pokemon.name} has a base experience of ${data.base_experience}.`,
      `Its habitat is typically ${data.habitat ? data.habitat.name : 'unknown'}.`,
      `This Pokémon's capture rate is ${data.capture_rate} out of 255.`,
      `${pokemon.name} hatches from eggs after ${data.hatch_counter * 255} steps.`,
      `Its growth rate is classified as '${data.growth_rate.name}'.`,
      `In terms of species, ${pokemon.name} is known as the ${data.genera.find((g: any) => g.language.name === 'en').genus}.`
    ];
    
    return facts[Math.floor(Math.random() * facts.length)];
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return `${pokemon.name} is a mysterious Pokémon with many secrets yet to be uncovered.`;
  }
 }, []);

 const filteredPokemon = pokemonList
   .sort((a, b) => a.id - b.id)
   .filter(pokemon => 
    (selectedRegion === 'all' || pokemon.region === selectedRegion) &&
    (pokemon.name.toLowerCase().includes(filter.toLowerCase()) ||
    pokemon.id.toString().includes(filter))
   )

 const scrollLeft = () => {
   if (scrollContainerRef.current) {
     const firstChild = scrollContainerRef.current.firstElementChild as HTMLElement;
     if (firstChild) {
       firstChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
     }
   }
 }

 const scrollRight = () => {
   if (scrollContainerRef.current) {
     const lastChild = scrollContainerRef.lastElementChild as HTMLElement;
     if (lastChild) {
       lastChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
     }
   }
 }

 const handleSelectPokemon = (pokemon: Pokemon) => {
   setSelectedPokemon(pokemon)
 }

const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => (
 <div 
   className="w-[400px] h-[calc(100vh-220px)] shrink-0 bg-[rgba(24,191,191,0.1)] p-4 rounded border border-[#18BFBF] flex flex-col items-center cursor-pointer" 
   onClick={() => handleSelectPokemon(pokemon)}
 >
   <div className="text-center mb-2">
     <span className="text-lg font-semibold">#{String(pokemon.id).padStart(4, '0')}</span>
   </div>
   <div className="bg-[rgba(24,191,191,0.1)] rounded border border-[#18BFBF] p-4 flex items-center justify-center h-[400px] w-full mb-4">
     <div className="relative w-full h-full">
       <img 
         src={pokemon.officialArtwork || pokemon.image || "/placeholder.svg"} 
         alt={pokemon.name} 
         className="absolute inset-0 w-full h-full object-contain"
       />
     </div>
   </div>
   <h3 className="text-xl font-semibold mb-2 uppercase">{pokemon.name}</h3>
   <div className="flex gap-2 mb-4">
     {pokemon.types.map((type) => (
       <span 
         key={type}
         className={`px-3 py-1 rounded-full text-white text-sm uppercase ${TYPE_COLORS[type as keyof typeof TYPE_COLORS]}`}
       >
         {type}
       </span>
     ))}
   </div>
   <div className="bg-[rgba(24,191,191,0.2)] w-full p-4 rounded flex-grow overflow-y-auto">
     <div className="space-y-2">
       {pokemon.stats.map((stat) => {
         const displayValue = stat.name === 'hp' 
           ? calculateHP(stat.value, pokemon.level)
           : Math.floor((((2 * stat.value + 31 + 5) * pokemon.level) / 100) + 5);
         return (
           <div key={stat.name} className="flex justify-between items-center">
             <span className="text-sm uppercase">{stat.name}</span>
             <span className="text-sm font-semibold">{displayValue}</span>
           </div>
         );
       })}
     </div>
   </div>
 </div>
)

const SelectedPokemonView = ({ pokemon, onBack }: { pokemon: Pokemon, onBack: () => void }) => (
 <div className="h-[calc(100vh-220px)]">
   <div className="flex justify-between items-center mb-4">
     <Input
       type="text"
       placeholder="Search by name or number..."
       value={filter}
       onChange={(e) => setFilter(e.target.value)}
       className="flex-grow bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white placeholder:text-white/50"
     />
     <Button 
       onClick={onBack}
       className="bg-[rgba(24,191,191,0.2)] hover:bg-[rgba(24,191,191,0.3)]"
     >
       Back to List
     </Button>
   </div>
   <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto">
     <div className="bg-[rgba(24,191,191,0.1)] rounded border border-[#18BFBF] p-4 flex items-center justify-center min-h-[500px]">
       <div className="relative w-[400px] h-[400px]">
         <img 
           src={pokemon.officialArtwork || pokemon.image || "/placeholder.svg"} 
           alt={pokemon.name} 
           className="absolute inset-0 w-full h-full object-contain"
         />
       </div>
     </div>
     <div className="bg-[rgba(24,191,191,0.1)] rounded border border-[#18BFBF] p-6">
       <div className="flex justify-between items-center mb-4">
         <h2 className="text-2xl font-bold">{pokemon.name.toUpperCase()}</h2>
         <span className="text-xl">#{String(pokemon.id).padStart(3, '0')}</span>
       </div>
       <div className="flex gap-2 mb-4">
         {pokemon.types.map((type) => (
           <span 
             key={type}
             className={`px-4 py-1 rounded-full text-white text-sm uppercase ${TYPE_COLORS[type as keyof typeof TYPE_COLORS]}`}
           >
             {type}
           </span>
         ))}
       </div>
       <div className="space-y-4">
         <section>
           <h3 className="text-lg font-semibold mb-2">STATS</h3>
           {pokemon.stats.map((stat) => {
             const displayValue = stat.name === 'hp' 
               ? calculateHP(stat.value, pokemon.level)
               : Math.floor((((2 * stat.value + 31 + 5) * pokemon.level) / 100) + 5);
             return (
               <div key={stat.name} className="mb-2">
                 <div className="flex justify-between text-sm mb-1">
                   <span className="uppercase">{stat.name}</span>
                   <span>{displayValue}</span>
                 </div>
                 <div className="h-2 bg-[rgba(24,191,191,0.1)] rounded-full overflow-hidden">
                   <div
                     className="h-full bg-[#18BFBF]"
                     style={{ width: `${(displayValue / 255) * 100}%` }}
                   />
                 </div>
               </div>
             );
           })}
         </section>
         <section>
           <h3 className="text-lg font-semibold mb-2">DETAILS</h3>
           <p>Height: {pokemon.height}m</p>
           <p>Weight: {pokemon.weight}kg</p>
         </section>
         <section>
           <h3 className="text-lg font-semibold mb-2">FUN FACT</h3>
           <FunFact pokemon={pokemon} generateFunFact={generateFunFact} />
         </section>
         <section>
           <h3 className="text-lg font-semibold mb-2">LEVEL-UP MOVES</h3>
           <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
             {pokemon.moves
               .sort((a, b) => a.level_learned_at - b.level_learned_at)
               .map((move) => (
                 <div key={move.name} className="flex justify-between bg-[rgba(24,191,191,0.1)] px-3 py-1 rounded">
                   <span className="text-sm uppercase">{move.name}</span>
                   <span className="text-sm">Lv. {move.level_learned_at}</span>
                 </div>
               ))}
           </div>
         </section>
         <section>
           <h3 className="text-lg font-semibold mb-2">TM MOVES</h3>
           <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
             {pokemon.tmMoves.map((move) => (
               <div key={move.name} className="bg-[rgba(24,191,191,0.1)] px-3 py-1 rounded">
                 <span className="text-sm uppercase">{move.name}</span>
               </div>
             ))}
           </div>
         </section>
       </div>
     </div>
   </div>
 </div>
)

 const handleTouchStart = (e: React.TouchEvent) => {
   const touch = e.touches[0];
   if (touch && scrollContainerRef.current) {
     const scrollLeft = scrollContainerRef.current.scrollLeft;
     scrollContainerRef.current.dataset.scrollLeft = scrollLeft.toString();
     scrollContainerRef.current.dataset.startX = touch.clientX.toString();
   }
 }

 const handleTouchMove = (e: React.TouchEvent) => {
   const touch = e.touches[0];
   if (touch && scrollContainerRef.current) {
     const startX = parseInt(scrollContainerRef.current.dataset.startX || '0');
     const scrollLeft = parseInt(scrollContainerRef.current.dataset.scrollLeft || '0');
     const x = touch.clientX - startX;
     scrollContainerRef.current.scrollLeft = scrollLeft - x;
   }
 }

 return (
   <div className="p-4 bg-[#0F2F2F] text-white h-full">
     <h2 className="text-2xl font-semibold uppercase tracking-wider mb-6">Pokédex</h2>
     {selectedPokemon ? (
       <SelectedPokemonView 
         pokemon={selectedPokemon} 
         onBack={() => setSelectedPokemon(null)} 
       />
     ) : (
       <>
         <div className="mb-4 flex flex-col sm:flex-row gap-4">
           <Input
             type="text"
             placeholder="Search by name or number..."
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="flex-grow bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white placeholder:text-white/50"
           />
           <Select
            value={selectedRegion}
            onValueChange={setSelectedRegion}
          >
            <SelectTrigger className="w-[180px] bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
              <SelectItem value="all" className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">All Regions</SelectItem>
              <SelectItem value="kanto" className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Kanto</SelectItem>
              <SelectItem value="johto" className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Johto</SelectItem>
              <SelectItem value="hoenn" className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Hoenn</SelectItem>
              <SelectItem value="sinnoh" className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Sinnoh</SelectItem>
              <SelectItem value="unova" className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Unova</SelectItem>
              <SelectItem value="kalos" className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Kalos</SelectItem>
              <SelectItem value="alola" className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Alola</SelectItem>
              <SelectItem value="galar" className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Galar</SelectItem>
              <SelectItem value="paldea" className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]">Paldea</SelectItem>
            </SelectContent>
          </Select>
         </div>
         <div className="relative flex-grow">
           <Button 
             onClick={scrollLeft} 
             className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-[rgba(24,191,191,0.5)] hover:bg-[rgba(24,191,191,0.7)]"
           >
             <ChevronLeft className="h-6 w-6" />
           </Button>
           <div 
             ref={scrollContainerRef}
             className="flex flex-nowrap gap-6 overflow-x-auto overflow-y-hidden h-[calc(100vh-220px)] px-6"
             style={{ 
               scrollbarWidth: 'none', 
               msOverflowStyle: 'none',
               whiteSpace: 'nowrap',
               scrollSnapType: 'x mandatory'
             }}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
           >
             {filteredPokemon.map(pokemon => (
               <PokemonCard key={pokemon.id} pokemon={pokemon} />
             ))}
           </div>
           <Button 
             onClick={scrollRight} 
             className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-[rgba(24,191,191,0.5)] hover:bg-[rgba(24,191,191,0.7)]"
           >
             <ChevronRight className="h-6 w-6" />
           </Button>
         </div>
       </>
     )}
   </div>
 )
}

