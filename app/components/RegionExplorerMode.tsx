'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const REGIONS = [
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Unova',
  'Kalos',
  'Alola',
  'Galar',
  'Paldea'
] as const

type Region = typeof REGIONS[number]

interface RegionInfo {
  name: Region
  description: string
  realWorldInspiration: string
  maps: {
    [key: string]: string // game version: map URL
  }
}

const regionInfo: Record<Region, RegionInfo> = {
  Kanto: {
    name: 'Kanto',
    description: 'Kanto is the setting of the first generation of Pokémon games and is based on the real-life Kantō region of Japan. It features a mix of urban areas, rural towns, and diverse natural environments.',
    realWorldInspiration: 'Kantō region, Japan',
    maps: {
      'Red/Blue': 'https://archives.bulbagarden.net/media/upload/2/25/LGPE_Kanto_Map.png',
      'FireRed/LeafGreen': 'https://archives.bulbagarden.net/media/upload/0/08/Sevii_Islands.png',
    }
  },
  Johto: {
    name: 'Johto',
    description: 'Johto is the setting of the second generation of Pokémon games. It is located west of Kanto and features a blend of tradition and modernity, with many historical landmarks and sacred sites.',
    realWorldInspiration: 'Kansai region, Japan',
    maps: {
      'Gold/Silver': 'https://archives.bulbagarden.net/media/upload/6/64/JohtoMap.png',
      'HeartGold/SoulSilver': 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Johto_HGSS-2AaVakZvkb6jZvr7xHBxf4R7M7TweD.webp',
    }
  },
  Hoenn: {
    name: 'Hoenn',
    description: 'Hoenn is the setting of the third generation of Pokémon games. It is an island region with a tropical climate, featuring a variety of environments including beaches, dense forests, and volcanic areas.',
    realWorldInspiration: 'Kyushu region, Japan',
    maps: {
      'Ruby/Sapphire': 'https://archives.bulbagarden.net/media/upload/8/85/Hoenn_ORAS.png',
      'Omega Ruby/Alpha Sapphire': 'https://archives.bulbagarden.net/media/upload/8/85/Hoenn_ORAS.png',
    }
  },
  Sinnoh: {
    name: 'Sinnoh',
    description: 'Sinnoh is the setting of the fourth generation of Pokémon games. It is a region with varied geography, including a large central mountain range, lakes, and snowy areas.',
    realWorldInspiration: 'Hokkaido, Japan',
    maps: {
      'Diamond/Pearl': 'https://archives.bulbagarden.net/media/upload/0/08/Sinnoh_BDSP_artwork.png',
      'Brilliant Diamond/Shining Pearl': 'https://archives.bulbagarden.net/media/upload/0/08/Sinnoh_BDSP_artwork.png',
    }
  },
  Unova: {
    name: 'Unova',
    description: 'Unova is the setting of the fifth generation of Pokémon games. It is a region with a mix of urban and natural areas, featuring a large metropolitan city and various bridges connecting different parts of the region.',
    realWorldInspiration: 'New York City and surrounding areas, USA',
    maps: {
      'Black/White': 'https://archives.bulbagarden.net/media/upload/f/fc/Unova_B2W2.png',
      'Black 2/White 2': 'https://archives.bulbagarden.net/media/upload/f/fc/Unova_B2W2.png',
    }
  },
  Kalos: {
    name: 'Kalos',
    description: 'Kalos is the setting of the sixth generation of Pokémon games. It is a region known for its beauty and fashion, featuring a mix of historic architecture and modern cityscapes.',
    realWorldInspiration: 'France',
    maps: {
      'X/Y': 'https://archives.bulbagarden.net/media/upload/8/8a/Kalos_alt.png',
    }
  },
  Alola: {
    name: 'Alola',
    description: 'Alola is the setting of the seventh generation of Pokémon games. It is a tropical island region consisting of four main islands and several smaller ones, known for its unique culture and Pokémon variants.',
    realWorldInspiration: 'Hawaii, USA',
    maps: {
      'Sun/Moon': 'https://archives.bulbagarden.net/media/upload/0/0b/Alola_USUM_artwork.png',
      'Ultra Sun/Ultra Moon': 'https://archives.bulbagarden.net/media/upload/0/0b/Alola_USUM_artwork.png',
    }
  },
  Galar: {
    name: 'Galar',
    description: 'Galar is the setting of the eighth generation of Pokémon games. It is a region inspired by Great Britain, featuring diverse landscapes from rolling countryside to industrial cities and snowy mountains.',
    realWorldInspiration: 'United Kingdom',
    maps: {
      'Sword/Shield': 'https://archives.bulbagarden.net/media/upload/c/ce/Galar_artwork.png',
    }
  },
  Paldea: {
    name: 'Paldea',
    description: 'Paldea is the setting of the ninth generation of Pokémon games. It is a vast region with diverse ecosystems, featuring a large central city surrounded by various biomes and terrains.',
    realWorldInspiration: 'Iberian Peninsula (Spain and Portugal)',
    maps: {
      'Scarlet/Violet': 'https://archives.bulbagarden.net/media/upload/f/fd/Paldea_artwork.png',
    }
  },
}

const fetchRegionData = async (regionName: string) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/region/${regionName.toLowerCase()}`);
    if (!response.ok) throw new Error('Region not found');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${regionName} data:`, error);
    return null;
  }
};

export default function RegionExplorerMode() {
  const [selectedRegion, setSelectedRegion] = useState<Region>('Kanto')
  const [regionData, setRegionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [selectedMap, setSelectedMap] = useState(Object.keys(regionInfo[selectedRegion].maps)[0]);


  useEffect(() => {
    const loadRegionData = async () => {
      setIsLoading(true);
      const data = await fetchRegionData(selectedRegion);
      setRegionData(data);
      setIsLoading(false);
      setImageError(!data);
    };
    loadRegionData();
  }, [selectedRegion]);

  const handleRegionChange = (region: Region) => {
    setSelectedRegion(region)
    setIsLoading(true)
    setImageError(false)
    setSelectedMap(Object.keys(regionInfo[region].maps)[0])
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  const handleImageError = (error: any) => {
    console.error(`Failed to load image for ${selectedRegion}:`, error.target?.src);
    setIsLoading(false);
    setImageError(true);
  };

  return (
    <div className="p-4 bg-[#0F2F2F] text-white">
      <div className="mb-4 flex items-center space-x-4">
        <Select
          value={selectedRegion}
          onValueChange={(value: Region) => handleRegionChange(value)}
        >
          <SelectTrigger className="w-[180px] bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white">
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
            {REGIONS.map((region) => (
              <SelectItem 
                key={region} 
                value={region}
                className="text-white hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
              >
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex space-x-2">
          {Object.keys(regionInfo[selectedRegion].maps).map((version) => (
            <Button
              key={version}
              onClick={() => setSelectedMap(version)}
              variant={selectedMap === version ? "default" : "outline"}
              className="bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-white hover:bg-[rgba(24,191,191,0.3)]"
            >
              {version}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="w-full h-[600px] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p>Loading map...</p>
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(24,191,191,0.1)] border-2 border-[#18BFBF] rounded">
              <p>Map not available for this region</p>
            </div>
          ) : (
            <img 
              key={selectedRegion}
              src={regionData?.main_generation?.url ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${regionData.main_generation.url.split('/').slice(-2, -1)[0]}.png` : "/placeholder.svg"}
              alt={`${selectedRegion} map`} 
              className="w-full h-full object-contain border-2 border-[#18BFBF] rounded bg-[rgba(24,191,191,0.1)]"
              style={{ imageRendering: 'pixelated' }}
              onLoad={() => setIsLoading(false)}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className="bg-[rgba(24,191,191,0.1)] p-4 rounded border border-[#18BFBF] text-white">
          <h2 className="text-2xl mb-2">{selectedRegion} Region</h2>
          <p className="mb-2">{regionInfo[selectedRegion].description}</p>
          <p className="mb-2"><strong>Real-world inspiration:</strong> {regionInfo[selectedRegion].realWorldInspiration}</p>
          {regionData && (
            <p className="mb-2"><strong>Number of locations:</strong> {regionData.locations?.length || 'Unknown'}</p>
          )}
        </div>
      </div>
    </div>
  )
}

