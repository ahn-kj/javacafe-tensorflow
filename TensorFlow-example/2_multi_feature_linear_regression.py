#-*- coding: utf-8 -*-

import tensorflow as tf

x1_data = [54, 8, 30, 24, 46, 12, 20, 37, 40, 48]
x2_data = [12, 0, 12, 15, 12, 0, 36, 12, 12, 24]
y_data = [800, 320, 600, 630, 700, 300, 920, 720, 700, 920]

W1 = tf.Variable(tf.random_uniform([1], -1.0, 1.0))
W2 = tf.Variable(tf.random_uniform([1], -1.0, 1.0))
b = tf.Variable(tf.random_uniform([1], -1.0, 1.0))

X1 = tf.placeholder(tf.float32)
X2 = tf.placeholder(tf.float32)
Y = tf.placeholder(tf.float32)

hypothesis = W1 * X1 + W2 * X2 + b

cost = tf.reduce_mean(tf.square(hypothesis - Y))

learning_rate = 0.0006
optimizer = tf.train.GradientDescentOptimizer(learning_rate).minimize(cost)

init = tf.initialize_all_variables()

sess = tf.Session()
sess.run(init)

for step in xrange(40000):
    sess.run(optimizer, feed_dict={X1: x1_data, X2: x2_data, Y: y_data})

    if step % 100 == 0:
        print step, sess.run(cost, feed_dict={X1: x1_data, X2: x2_data, Y: y_data}), sess.run(W1), sess.run(W2), sess.run(b)

print sess.run(hypothesis, feed_dict={X1: 10, X2: 10})
