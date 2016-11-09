import tensorflow as tf

x_data = [54, 8, 30, 24, 46, 12, 20, 37, 40, 48]
y_data = [800, 320, 600, 630, 700, 680, 730, 720, 700, 920]

W = tf.Variable(tf.random_uniform([1], -1.0, 1.0))
b = tf.Variable(tf.random_uniform([1], -1.0, 1.0))

X = tf.placeholder(tf.float32)
Y = tf.placeholder(tf.float32)

hypothesis = W * X + b

cost = tf.reduce_mean(tf.square(hypothesis - Y) + 1e-10)

learning_rate = 0.0008
optimizer = tf.train.GradientDescentOptimizer(learning_rate).minimize(cost)

init = tf.initialize_all_variables()

sess = tf.Session()
sess.run(init)

for step in xrange(2000):
    sess.run(optimizer, feed_dict={X: x_data, Y: y_data})

    if step % 20 == 0:
        print step, sess.run(cost, feed_dict={X: x_data, Y: y_data}), sess.run(W), sess.run(b)

print sess.run(hypothesis, feed_dict={X: 10})
print sess.run(hypothesis, feed_dict={X: 20})
