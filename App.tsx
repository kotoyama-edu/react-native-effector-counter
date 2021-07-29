import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createStore, createEvent, createEffect, forward} from 'effector';
import {useStore} from 'effector-react';

const init = createEvent<number>();
const increment = createEvent();
const decrement = createEvent();
const reset = createEvent();

const fetchCountFromAsyncStorageFx = createEffect({
  async handler() {
    const value = parseInt((await AsyncStorage.getItem('count')) || '', 10);
    return !isNaN(value) ? value : 0;
  },
});

const updateCountInAsyncStorageFx = createEffect({
  async handler(count: number) {
    try {
      await AsyncStorage.setItem('count', `${count}`, err => {
        if (err) {
          console.error(err);
        }
      });
    } catch (err) {
      console.error(err);
    }
  },
});

fetchCountFromAsyncStorageFx.doneData.watch(result => init(result));

const counter = createStore(0)
  .on(increment, state => state + 1)
  .on(decrement, state => state - 1)
  .on(init, (_, value) => value)
  .reset(reset);

forward({
  from: counter,
  to: updateCountInAsyncStorageFx,
});

fetchCountFromAsyncStorageFx();

export const App = () => {
  const count = useStore(counter);

  const handleInc = () => increment();
  const handleDec = () => decrement();
  const handleReset = () => reset();

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{count}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity key="dec" onPress={handleDec} style={styles.button}>
          <Text style={styles.label}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity key="reset" onPress={handleReset} style={styles.button}>
          <Text style={styles.label}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity key="inc" onPress={handleInc} style={styles.button}>
          <Text style={styles.label}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  button: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4287f5',
    borderRadius: 5,
  },
  label: {
    fontSize: 30,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
