import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";

const API_KEY = "3779dd0ae5fea606b18243e69b4fc3ed"; // OpenWeatherMap key
const CITY = "Alberton";

export default function App() {
  const [weather, setWeather] = useState<any>(null); // current weather
  const [forecast, setForecast] = useState<any[]>([]); // 5-day forecast
  const [loading, setLoading] = useState(true);

  const scrollX = useRef(new Animated.Value(0)).current; // track horizontal scroll

  // Function to load weather data
  const fetchWeather = async () => {
    try {
      setLoading(true);

      // Get current weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`
      );
      const currentData = await currentRes.json();

      // Get 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=metric&appid=${API_KEY}`
      );
      const forecastData = await forecastRes.json();

      // Pick 1 forecast per day (every 8th item)
      const daily = forecastData.list.filter((_: any, index: number) => index % 8 === 0);

      setWeather(currentData);
      setForecast(daily);
    } catch (err) {
      console.error("Error fetching weather:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load once when app starts
  useEffect(() => {
    fetchWeather();
  }, []);

  // Loading screen
  if (loading || !weather) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
        <Text style={{ marginTop: 20 }}>Loading weather...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* City and Date */}
      <Text style={styles.city}>{weather.name}</Text>
      <Text>{new Date().toLocaleString()}</Text>

      {/* Current weather */}
      <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
      <Text style={styles.desc}>{weather.weather[0].description}</Text>

      {/* 5-day forecast with animated scroll */}
      <Animated.FlatList
        data={forecast}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.dt.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item, index }) => {
          // Animation: fade + scale based on scroll
          const inputRange = [
            (index - 1) * 200,
            index * 200,
            (index + 1) * 200,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          return (
            <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
              <Text style={styles.day}>
                {new Date(item.dt * 1000).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </Text>
              <Text style={styles.cardTemp}>{Math.round(item.main.temp)}°C</Text>
              <Text>{item.weather[0].main}</Text>
            </Animated.View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#B3E5FC", // baby blue
    padding: 20,
  },
  city: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  temp: {
    fontSize: 48,
    fontWeight: "300",
    marginVertical: 10,
  },
  desc: {
    fontSize: 18,
    marginBottom: 20,
    textTransform: "capitalize",
  },
  card: {
    backgroundColor: "#E1F5FE", // lighter baby blue
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 10,
    width: 180,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  day: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardTemp: {
    fontSize: 24,
    marginVertical: 8,
  },
});

